import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import { LoginUtilsError } from "@pagopa/io-react-native-login-utils";
import CookieManager from "@react-native-cookies/cookies";
import { pipe } from "fp-ts/lib/function";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import {
  createRef,
  Dispatch,
  ReactElement,
  SetStateAction,
  useCallback,
  useEffect,
  useState
} from "react";
import { Platform, View } from "react-native";
import WebView from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewNavigation,
  WebViewNavigationEvent,
  WebViewSource
} from "react-native-webview/lib/WebViewTypes";
import I18n from "i18next";
import { withLoadingSpinner } from "../../../../../components/helpers/withLoadingSpinner";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { selectedIdentityProviderSelector } from "../../../../../features/authentication/common/store/selectors";
import { ephemeralKeyTagSelector } from "../../../../../features/lollipop/store/reducers/lollipop";
import { regenerateKeyGetRedirectsAndVerifySaml } from "../../../../../features/lollipop/utils/login";
import { useHardwareBackButton } from "../../../../../hooks/useHardwareBackButton";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { isMixpanelEnabled } from "../../../../../store/reducers/persistedPreferences";
import { trackSpidLoginError } from "../../../../../utils/analytics";
import { closeInjectedScript } from "../../../../../utils/webview";
import { getIdpLoginUri } from "../../../common/utils/login";
import { isFastLoginEnabledSelector } from "../../../fastLogin/store/selectors";
import { isCieLoginUatEnabledSelector } from "../store/selectors";
import { cieFlowForDevServerEnabled } from "../utils";
import { remoteApiLoginUrlPrefixSelector } from "../../../loginPreferences/store/selectors";
import {
  isActiveSessionFastLoginEnabledSelector,
  isActiveSessionLoginSelector
} from "../../../activeSessionLogin/store/selectors";
import { hashedProfileFiscalCodeSelector } from "../../../../../store/reducers/crossSessions";

// to make sure the server recognizes the client as valid iPhone device (iOS only) we use a custom header
// on Android it is not required
const iOSUserAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";
const defaultUserAgent = Platform.select({
  ios: iOSUserAgent,
  default: undefined
});

/**
 * This JS is injection on every page load. It tries to decrease to 0 the sleeping time of a script.
 * That sleeping is used to allow user to read page content until the content changes to an automatic redirect.
 * This script also tries also to call apriIosUL.
 * If it is defined it starts the authentication process (iOS only).
 */
const injectJs =
  Platform.OS === "ios"
    ? `
  seconds = 0;
  if(typeof apriIosUL !== 'undefined' && apriIosUL !== null){
    apriIosUL();
  }
`
    : undefined;

type Props = {
  onClose: () => void;
  onSuccess: (authorizationUri: string) => void;
};

type InternalState = {
  authUrl: string | undefined;
  error: boolean;
  key: number;
};

const generateResetState: () => InternalState = () => ({
  authUrl: undefined,
  error: false,
  key: 1
});

const generateFoundAuthUrlState: (
  authUr: string,
  state: InternalState
) => InternalState = (authUrl: string, state: InternalState) => ({
  ...state,
  authUrl
});

const generateErrorState: (state: InternalState) => InternalState = (
  state: InternalState
) => ({
  ...state,
  error: true
});

const generateRetryState: (state: InternalState) => InternalState = (
  state: InternalState
) => ({
  ...state,
  error: false,
  key: state.key + 1
});

type RequestInfoAuthorizedState = {
  requestState: "AUTHORIZED";
  nativeAttempts: number;
  url: string;
};

type RequestInfoLoadingState = {
  requestState: "LOADING";
  nativeAttempts: number;
};

type RequestInfo = RequestInfoLoadingState | RequestInfoAuthorizedState;

function retryRequest(
  setInternalState: Dispatch<SetStateAction<InternalState>>,
  setRequestInfo: Dispatch<SetStateAction<RequestInfo>>
) {
  setInternalState(generateRetryState);
  setRequestInfo(requestInfo => ({
    requestState: "LOADING",
    nativeAttempts: requestInfo.nativeAttempts + 1
  }));
}

export enum CieEntityIds {
  PROD = "xx_servizicie",
  DEV = "xx_servizicie_coll"
}

const CieWebView = (props: Props) => {
  const [internalState, setInternalState] = useState<InternalState>(
    generateResetState()
  );

  const [requestInfo, setRequestInfo] = useState<RequestInfo>({
    requestState: "LOADING",
    nativeAttempts: 0
  });

  const useCieUat = useIOSelector(isCieLoginUatEnabledSelector);
  const CIE_IDP_ID = useCieUat ? CieEntityIds.DEV : CieEntityIds.PROD;
  const remoteApiLoginUrlPrefix = useIOSelector(
    remoteApiLoginUrlPrefixSelector
  );
  const loginUri = getIdpLoginUri(CIE_IDP_ID, 3, remoteApiLoginUrlPrefix);

  const mixpanelEnabled = useIOSelector(isMixpanelEnabled);
  const dispatch = useIODispatch();

  const ephemeralKeyTag = useIOSelector(ephemeralKeyTagSelector);
  const isFastLogin = useIOSelector(isFastLoginEnabledSelector);
  const idp = useIOSelector(selectedIdentityProviderSelector);
  const isActiveSessionFastLogin = useIOSelector(
    isActiveSessionFastLoginEnabledSelector
  );
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);
  const hashedFiscalCode = useIOSelector(hashedProfileFiscalCodeSelector);

  const webView = createRef<WebView>();
  const { onSuccess } = props;

  const handleOnError = useCallback(
    (
      e: Error | LoginUtilsError | WebViewErrorEvent | WebViewHttpErrorEvent
    ) => {
      trackSpidLoginError("cie", e);
      setInternalState(state => generateErrorState(state));
    },
    []
  );

  useEffect(() => {
    if (internalState.authUrl !== undefined) {
      onSuccess(internalState.authUrl);
      // reset the state when authUrl has been found
      setInternalState(generateResetState());
    }
  }, [internalState.authUrl, onSuccess]);

  const handleOnShouldStartLoadWithRequest = (
    event: WebViewNavigation
  ): boolean => {
    if (internalState.authUrl !== undefined) {
      return false;
    }

    const url = event.url;

    // on iOS when authnRequestString is present in the url, it means we have all stuffs to go on.
    if (
      url !== undefined &&
      Platform.OS === "ios" &&
      url.indexOf("authnRequestString") !== -1
    ) {
      // avoid redirect and follow the 'happy path'
      if (webView.current !== null) {
        setInternalState(state => generateFoundAuthUrlState(url, state));
      }
      return false;
    }

    // Once the returned url contains the "OpenApp" string, then the authorization has been given
    if (url && url.indexOf("OpenApp") !== -1) {
      setInternalState(state => generateFoundAuthUrlState(url, state));
      return false;
    }

    // On the dev-server, the ACS endpoint is /idp-login.
    // Intercepting it allows us to extract the authentication result
    // (token or error) after a successful CIE login.
    if (cieFlowForDevServerEnabled && url.indexOf("idp-login") !== -1) {
      setInternalState(state => generateFoundAuthUrlState(url, state));
      return false;
    }

    return true;
  };

  const handleOnLoadEnd = (e: WebViewNavigationEvent | WebViewErrorEvent) => {
    const eventTitle = e.nativeEvent.title.toLowerCase();
    if (
      eventTitle === "pagina web non disponibile" ||
      // On Android, if we attempt to access the idp URL twice,
      // we are presented with an error page titled "ERROR".
      eventTitle === "errore"
    ) {
      handleOnError(new Error(eventTitle));
    }
    // inject JS on every page load end
    if (injectJs && webView.current) {
      webView.current.injectJavaScript(closeInjectedScript(injectJs));
    }
  };

  if (internalState.error) {
    return (
      <ErrorComponent
        onRetry={() => {
          retryRequest(setInternalState, setRequestInfo);
        }}
        onClose={props.onClose}
      />
    );
  }

  if (requestInfo.requestState === "LOADING") {
    void pipe(
      TE.tryCatch(
        () =>
          Platform.OS === "android"
            ? CookieManager.removeSessionCookies()
            : Promise.resolve(true),
        () => new Error("Error clearing cookies")
      ),
      TE.chain(
        _ => () =>
          regenerateKeyGetRedirectsAndVerifySaml(
            loginUri,
            ephemeralKeyTag,
            mixpanelEnabled,
            isActiveSessionLogin ? isActiveSessionFastLogin : isFastLogin,
            dispatch,
            idp?.id,
            isActiveSessionLogin ? hashedFiscalCode : undefined
          )
      ),
      TE.fold(
        e => T.of(handleOnError(e)),
        url =>
          T.of(
            setRequestInfo({
              requestState: "AUTHORIZED",
              nativeAttempts: requestInfo.nativeAttempts,
              url
            })
          )
      )
    )();
  }

  const WithLoading = withLoadingSpinner(() => (
    <View style={{ flex: 1 }}>
      {requestInfo.requestState === "AUTHORIZED" &&
        internalState.authUrl === undefined && (
          <WebView
            testID="webview"
            androidCameraAccessDisabled={true}
            androidMicrophoneAccessDisabled={true}
            ref={webView}
            userAgent={defaultUserAgent}
            javaScriptEnabled={true}
            injectedJavaScript={injectJs}
            onLoadEnd={handleOnLoadEnd}
            onError={handleOnError}
            onHttpError={handleOnError}
            onShouldStartLoadWithRequest={handleOnShouldStartLoadWithRequest}
            source={{ uri: requestInfo.url } as WebViewSource}
            key={internalState.key}
          />
        )}
    </View>
  ));

  return (
    <WithLoading
      isLoading={!cieFlowForDevServerEnabled}
      loadingOpacity={1.0}
      loadingCaption={I18n.t("global.genericWaiting")}
      onCancel={props.onClose}
    />
  );
};

const ErrorComponent = (
  props: { onRetry: () => void } & Pick<Props, "onClose">
) => {
  const theme = useIOTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: IOColors[theme["appBackground-primary"]]
      }}
    >
      <OperationResultScreenContent
        pictogram="umbrella"
        title={I18n.t("authentication.errors.network.title")}
        action={{
          label: I18n.t("global.buttons.retry"),
          accessibilityLabel: I18n.t("global.buttons.retry"),
          onPress: props.onRetry
        }}
        secondaryAction={{
          label: I18n.t("global.buttons.cancel"),
          accessibilityLabel: I18n.t("global.buttons.cancel"),
          onPress: props.onClose
        }}
      />
    </View>
  );
};
/**
 * A screen to manage the request of authentication once the pin of the user's CIE has been inserted
 * 1) Start the first request with the getIdpLoginUri(CIE_IDP_ID) uri
 * 2) Accepts all the redirects until the uri with the right path is found and stop the loading
 * 3) Dispatch the found uri using the `onSuccess` callback
 * @param props
 * @constructor
 */
export const CieRequestAuthenticationOverlay = (props: Props): ReactElement => {
  // Disable android back button
  useHardwareBackButton(() => {
    props.onClose();
    return true;
  });

  return <CieWebView {...props} />;
};
