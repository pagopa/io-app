import * as React from "react";
import { createRef, useEffect } from "react";
import { View, Platform, SafeAreaView, StyleSheet } from "react-native";
import WebView from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewNavigation,
  WebViewNavigationEvent,
  WebViewSource
} from "react-native-webview/lib/WebViewTypes";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { useHardwareBackButton } from "../../hooks/useHardwareBackButton";
import I18n from "../../i18n";
import { getIdpLoginUri } from "../../utils/login";
import { closeInjectedScript } from "../../utils/webview";
import { IOColors } from "../core/variables/IOColors";
import { IOStyles } from "../core/variables/IOStyles";
import { withLoadingSpinner } from "../helpers/withLoadingSpinner";
import GenericErrorComponent from "../screens/GenericErrorComponent";
import { lollipopKeyTagSelector } from "../../features/lollipop/store/reducers/lollipop";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { isMixpanelEnabled } from "../../store/reducers/persistedPreferences";
import { regenerateKeyGetRedirectsAndVerifySaml } from "../../features/lollipop/utils/login";
import { mixpanelTrack } from "../../mixpanel";

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: IOColors.white
  }
});

// to make sure the server recognizes the client as valid iPhone device (iOS only) we use a custom header
// on Android it is not required
const iOSUserAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";
const defaultUserAgent = Platform.select({
  ios: iOSUserAgent,
  default: undefined
});

// INFA PROD -> xx_servizicie
// INFRA DEV -> xx_servizicie_test
const CIE_IDP_ID = "xx_servizicie";
const loginUri = getIdpLoginUri(CIE_IDP_ID, 3);

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
  setInternalState: React.Dispatch<React.SetStateAction<InternalState>>,
  setRequestInfo: React.Dispatch<React.SetStateAction<RequestInfo>>
) {
  setInternalState(generateRetryState);
  setRequestInfo(requestInfo => ({
    requestState: "LOADING",
    nativeAttempts: requestInfo.nativeAttempts + 1
  }));
}

const CieWebView = (props: Props) => {
  const [internalState, setInternalState] = React.useState<InternalState>(
    generateResetState()
  );

  const [requestInfo, setRequestInfo] = React.useState<RequestInfo>({
    requestState: "LOADING",
    nativeAttempts: 0
  });

  const mixpanelEnabled = useIOSelector(isMixpanelEnabled);
  const dispatch = useIODispatch();

  const maybeKeyTag = useIOSelector(lollipopKeyTagSelector);

  const webView = createRef<WebView>();
  const { onSuccess } = props;

  const handleOnError = React.useCallback((e: Error | WebViewErrorEvent) => {
    if (e instanceof Error) {
      void mixpanelTrack("SPID_ERROR", {
        idp: "cie",
        code: e.message,
        description: e.message,
        domain: e.message
      });
    }
    setInternalState(state => generateErrorState(state));
  }, []);

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
        const authUrl = url.replace("nextUrl=", "OpenApp?nextUrl=");
        setInternalState(state => generateFoundAuthUrlState(authUrl, state));
      }
      return false;
    }

    // Once the returned url contains the "OpenApp" string, then the authorization has been given
    if (url && url.indexOf("OpenApp") !== -1) {
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

  if (O.isSome(maybeKeyTag) && requestInfo.requestState === "LOADING") {
    void pipe(
      TE.tryCatch(
        () =>
          regenerateKeyGetRedirectsAndVerifySaml(
            loginUri,
            maybeKeyTag.value,
            mixpanelEnabled,
            dispatch
          ),
        e => T.of(handleOnError(E.toError(e)))
      ),
      TE.fold(
        e => T.of(handleOnError(E.toError(e))),
        url =>
          pipe(
            url,
            E.fold(
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
          )
      )
    )();
  }

  const WithLoading = withLoadingSpinner(() => (
    <View style={IOStyles.flex}>
      {requestInfo.requestState === "AUTHORIZED" &&
        internalState.authUrl === undefined && (
          <WebView
            androidCameraAccessDisabled={true}
            androidMicrophoneAccessDisabled={true}
            ref={webView}
            userAgent={defaultUserAgent}
            javaScriptEnabled={true}
            injectedJavaScript={injectJs}
            onLoadEnd={handleOnLoadEnd}
            onError={handleOnError}
            onShouldStartLoadWithRequest={handleOnShouldStartLoadWithRequest}
            source={{ uri: requestInfo.url } as WebViewSource}
            key={internalState.key}
          />
        )}
    </View>
  ));

  return (
    <WithLoading
      isLoading={true}
      loadingOpacity={1.0}
      loadingCaption={I18n.t("global.genericWaiting")}
      onCancel={props.onClose}
    />
  );
};

const ErrorComponent = (
  props: { onRetry: () => void } & Pick<Props, "onClose">
) => (
  <SafeAreaView style={[IOStyles.flex, styles.errorContainer]}>
    <GenericErrorComponent
      avoidNavigationEvents={true}
      onRetry={props.onRetry}
      onCancel={props.onClose}
      image={require("../../../img/broken-link.png")} // TODO: use custom or generic image?
      text={I18n.t("authentication.errors.network.title")} // TODO: use custom or generic text?
    />
  </SafeAreaView>
);

/**
 * A screen to manage the request of authentication once the pin of the user's CIE has been inserted
 * 1) Start the first request with the getIdpLoginUri(CIE_IDP_ID) uri
 * 2) Accepts all the redirects until the uri with the right path is found and stop the loading
 * 3) Dispatch the found uri using the `onSuccess` callback
 * @param props
 * @constructor
 */
export const CieRequestAuthenticationOverlay = (
  props: Props
): React.ReactElement => {
  // Disable android back button
  useHardwareBackButton(() => {
    props.onClose();
    return true;
  });

  return <CieWebView {...props} />;
};
