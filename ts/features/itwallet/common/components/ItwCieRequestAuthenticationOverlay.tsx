import * as React from "react";
import { createRef, useEffect } from "react";
import { View, Platform, StyleSheet } from "react-native";
import WebView from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewNavigation,
  WebViewNavigationEvent
} from "react-native-webview/lib/WebViewTypes";
import { LoginUtilsError } from "@pagopa/io-react-native-login-utils";
import { IOColors, IOStyles } from "@pagopa/io-app-design-system";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import I18n from "../../../../i18n";
import { getIdpLoginUri } from "../../../../utils/login";
import { closeInjectedScript } from "../../../../utils/webview";
import { withLoadingSpinner } from "../../../../components/helpers/withLoadingSpinner";
import { useIOSelector } from "../../../../store/hooks";
import { trackSpidLoginError } from "../../../../utils/analytics";
import { isCieLoginUatEnabledSelector } from "../../../cieLogin/store/selectors";
import { cieFlowForDevServerEnabled } from "../../../cieLogin/utils";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";

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

function retryRequest(
  setInternalState: React.Dispatch<React.SetStateAction<InternalState>>
) {
  setInternalState(generateRetryState);
}

export enum CieEntityIds {
  PROD = "xx_servizicie",
  DEV = "xx_servizicie_coll"
}

const CieWebView = (props: Props) => {
  const [internalState, setInternalState] = React.useState<InternalState>(
    generateResetState()
  );

  const useCieUat = useIOSelector(isCieLoginUatEnabledSelector);
  const CIE_IDP_ID = useCieUat ? CieEntityIds.DEV : CieEntityIds.PROD;

  const webView = createRef<WebView>();
  const { onSuccess } = props;

  const handleOnError = React.useCallback(
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

    if (cieFlowForDevServerEnabled && url.indexOf("token=") !== -1) {
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
          retryRequest(setInternalState);
        }}
        onClose={props.onClose}
      />
    );
  }

  const WithLoading = withLoadingSpinner(() => (
    <View style={IOStyles.flex}>
      {internalState.authUrl === undefined && (
        <WebView
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
          source={{ uri: getIdpLoginUri(CIE_IDP_ID, 3) }}
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
) => (
  <View style={[IOStyles.flex, styles.errorContainer]}>
    <OperationResultScreenContent
      pictogram="umbrellaNew"
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
