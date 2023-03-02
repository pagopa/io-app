import { PublicKey } from "@pagopa/io-react-native-crypto";
import * as O from "fp-ts/lib/Option";
import { View } from "native-base";
import * as React from "react";
import { createRef, useEffect } from "react";
import { Platform, SafeAreaView } from "react-native";
import WebView from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewNavigation,
  WebViewNavigationEvent,
  WebViewSource
} from "react-native-webview/lib/WebViewTypes";
import URLParse from "url-parse";
import { useLollipopLoginSource } from "../../features/lollipop/hooks/useLollipopLoginSource";
import { LollipopCheckStatus } from "../../features/lollipop/types/LollipopCheckStatus";
import { publicKey } from "../../features/lollipop/types/LollipopLoginSource";
import { lollipopSamlVerify } from "../../features/lollipop/utils/login";
import { useHardwareBackButton } from "../../hooks/useHardwareBackButton";
import I18n from "../../i18n";
import { getIdpLoginUri } from "../../utils/login";
import { closeInjectedScript } from "../../utils/webview";
import { IOStyles } from "../core/variables/IOStyles";
import { withLoadingSpinner } from "../helpers/withLoadingSpinner";
import GenericErrorComponent from "../screens/GenericErrorComponent";

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
const loginUri = getIdpLoginUri(CIE_IDP_ID);

/**
 * This JS is injection on every page load. It tries to decrease to 0 the sleeping time of a script.
 * That sleeping is used to allow user to read page content until the content changes to an automatic redirect.
 * This script also tries also to call apriIosUL.
 * If it is defined it starts the authentication process (iOS only).
 */
const injectJs = `
  seconds = 0;
  if(typeof apriIosUL !== 'undefined' && apriIosUL !== null){
    apriIosUL();
  }
`;

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

const CieWebView = (props: Props) => {
  const [internalState, setInternalState] = React.useState<InternalState>(
    generateResetState()
  );
  const webView = createRef<WebView>();
  const { onSuccess } = props;

  // Android CIE login flow is different from iOS.
  // On Android to be sure to regenerate a new crypto key,
  // we need to pass a new value to useLollipopLoginSource: loginUriRetry.
  const { loginSource, regenerateLoginSource } =
    useLollipopLoginSource(loginUri);
  const [webviewSource, setWebviewSource] = React.useState<
    WebViewSource | undefined
  >(undefined);
  const [lollipopCheckStatus, setLollipopCheckStatus] =
    React.useState<LollipopCheckStatus>({ status: "none", url: O.none });

  const verifyLollipop = React.useCallback(
    (eventUrl: string, urlEncodedSamlRequest: string, publicKey: PublicKey) => {
      setWebviewSource(undefined);
      lollipopSamlVerify(
        urlEncodedSamlRequest,
        publicKey,
        () => {
          setLollipopCheckStatus({
            status: "trusted",
            url: O.some(eventUrl)
          });
          setWebviewSource({ uri: eventUrl });
        },
        () => {
          setLollipopCheckStatus({
            status: "untrusted",
            url: O.some(eventUrl)
          });
          handleOnError();
        }
      );
    },
    []
  );

  const startLoginProcess = React.useCallback(() => {
    if (loginSource.kind === "ready") {
      setWebviewSource(loginSource.value);
    }
  }, [loginSource]);

  useEffect(() => {
    startLoginProcess();
  }, [startLoginProcess]);

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
    const parsedUrl = new URLParse(url, true);
    const urlQuery = parsedUrl.query;
    const urlEncodedSamlRequest = urlQuery?.SAMLRequest;
    if (urlEncodedSamlRequest) {
      if (lollipopCheckStatus.status === "none") {
        // Make sure that we have a public key (since its retrieval
        // may have failed - in which case let the flow go through
        // the non-lollipop standard check process)
        const publicKeyOption = publicKey(loginSource);
        if (O.isSome(publicKeyOption)) {
          // Start Lollipop verification process
          setLollipopCheckStatus({
            status: "checking",
            url: O.some(url)
          });
          verifyLollipop(url, urlEncodedSamlRequest, publicKeyOption.value);
          // Prevent the WebView from loading the current URL (its
          // loading will be restored after LolliPOP verification
          // has succeded)
          return false;
        }
        // If code reaches this point, then either the public key
        // retrieval has failed or lollipop is not enabled. Let
        // the code flow follow the standard non-lollipop scenario
      } else if (lollipopCheckStatus.status === "checking") {
        // LolliPOP signature is being verified, prevent the WebView
        // from loading the current URL,
        return false;
      }

      // If code reaches this point, either there is no public key
      // or lollipop is not enabled or the LolliPOP signature has
      // been verified (in both cases, let the code flow). Code
      // flow shall never hit this method is LolliPOP signature
      // verification has failed, since an error is displayed and
      // the WebViewSource is left undefined
    }

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

  const handleOnError = () => {
    setInternalState(state => generateErrorState(state));
  };

  const handleOnLoadEnd = (e: WebViewNavigationEvent | WebViewErrorEvent) => {
    const eventTitle = e.nativeEvent.title.toLowerCase();
    if (
      eventTitle === "pagina web non disponibile" ||
      // On Android, if we attempt to access the idp URL twice,
      // we are presented with an error page titled "ERROR".
      eventTitle === "errore"
    ) {
      handleOnError();
    }
    // inject JS on every page load end
    if (webView.current) {
      webView.current.injectJavaScript(closeInjectedScript(injectJs));
    }
  };

  if (internalState.error) {
    return (
      <ErrorComponent
        onRetry={() => {
          setInternalState(state => generateRetryState(state));
          setLollipopCheckStatus({ status: "none", url: O.none });
          setWebviewSource(undefined);
          regenerateLoginSource();
        }}
        onClose={props.onClose}
      />
    );
  }

  const WithLoading = withLoadingSpinner(() => (
    <View style={IOStyles.flex}>
      {internalState.authUrl === undefined && (
        <WebView
          cacheEnabled={false}
          androidCameraAccessDisabled={true}
          androidMicrophoneAccessDisabled={true}
          ref={webView}
          userAgent={defaultUserAgent}
          javaScriptEnabled={true}
          injectedJavaScript={injectJs}
          onLoadEnd={handleOnLoadEnd}
          onError={handleOnError}
          onShouldStartLoadWithRequest={handleOnShouldStartLoadWithRequest}
          source={webviewSource}
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
  <SafeAreaView style={IOStyles.flex}>
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
