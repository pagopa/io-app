import { PublicKey } from "@pagopa/io-react-native-crypto";
import * as O from "fp-ts/lib/Option";
import { View } from "native-base";
import * as React from "react";
import { createRef, useEffect, useReducer } from "react";
import { Platform } from "react-native";
import WebView from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewNavigation,
  WebViewNavigationEvent,
  WebViewSource
} from "react-native-webview/lib/WebViewTypes";
import URLParse from "url-parse";
import { lollipopLoginEnabled } from "../../config";
import { useLollipopLoginSource } from "../../features/lollipop/hooks/useLollipopLoginSource";
import { LollipopCheckStatus } from "../../features/lollipop/types/LollipopCheckStatus";
import { publicKey } from "../../features/lollipop/types/LollipopLoginSource";
import { lollipopSamlVerify } from "../../features/lollipop/utils/login";
import { useHardwareBackButton } from "../../hooks/useHardwareBackButton";
import I18n from "../../i18n";
import { getAppVersion } from "../../utils/appVersion";
import { getIdpLoginUri } from "../../utils/login";
import { closeInjectedScript } from "../../utils/webview";
import { IOStyles } from "../core/variables/IOStyles";
import { withLoadingSpinner } from "../helpers/withLoadingSpinner";
import GenericErrorComponent from "../screens/GenericErrorComponent";

// TODO if left as it is, this would cause some IDP to offer limited login capabilities.
// See: https://pagopa.atlassian.net/browse/IOAPPCIT-46
const userAgentForWebView = lollipopLoginEnabled
  ? `IO-App/${getAppVersion()}`
  : undefined;

// to make sure the server recognizes the client as valid iPhone device (iOS only) we use a custom header
// on Android it is not required
const iOSUserAgent =
  (userAgentForWebView ? `${userAgentForWebView} ` : "") +
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";
const userAgent = Platform.select({
  ios: iOSUserAgent,
  default: userAgentForWebView
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

type InnerAction =
  | { kind: "foundAuthUrl"; authUrl: string }
  | { kind: "setError" }
  | { kind: "retry" }
  | { kind: "reset" };

type State = {
  authUrl: string | undefined;
  error: boolean;
  key: number;
};

const initState: State = {
  authUrl: undefined,
  error: false,
  key: 1
};

const reducer = (state: State, action: InnerAction): State => {
  switch (action.kind) {
    case "reset":
      return initState;
    case "foundAuthUrl":
      return { ...state, authUrl: action.authUrl };
    case "setError":
      return { ...state, error: true };
    case "retry":
      return { ...state, error: false, key: state.key + 1 };
  }
};

const CieWebView = (props: Props) => {
  const [{ authUrl, key, error }, dispatch] = useReducer(reducer, initState);
  const webView = createRef<WebView>();
  const { onSuccess } = props;

  const loginSource = useLollipopLoginSource(loginUri);
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
    if (authUrl !== undefined) {
      onSuccess(authUrl);
      // reset the state when authUrl has been found
      dispatch({ kind: "reset" });
    }
  }, [authUrl, onSuccess]);

  const handleOnShouldStartLoadWithRequest = (
    event: WebViewNavigation
  ): boolean => {
    if (authUrl !== undefined) {
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
        dispatch({
          kind: "foundAuthUrl",
          authUrl: url.replace("nextUrl=", "OpenApp?nextUrl=")
        });
      }
      return false;
    }

    // Once the returned url contains the "OpenApp" string, then the authorization has been given
    if (url && url.indexOf("OpenApp") !== -1) {
      dispatch({ kind: "foundAuthUrl", authUrl: url });
      return false;
    }
    return true;
  };

  const handleOnError = () => {
    dispatch({ kind: "setError" });
  };

  const handleOnLoadEnd = (e: WebViewNavigationEvent | WebViewErrorEvent) => {
    if (e.nativeEvent.title === "Pagina web non disponibile") {
      handleOnError();
    }
    // When attempting to log in with an incorrect user-agent on Lollipop,
    // we receive an HTTP 500 Server Error. Currently, we are unable to use
    // WebView.onHttpError() as our app's minSdk is set to a lower version.
    // Instead, we rely on WebView.onError() which returns a page without a title,
    // so we handle the error accordingly. Once our minSdk is set to 23 or higher,
    // we can improve this code by using WebView.onHttpError().
    // TODO: Update this code to utilize WebView.onHttpError() when our minSdk is 23 or higher.
    if (e.nativeEvent.title === "") {
      handleOnError();
    }
    // inject JS on every page load end
    if (webView.current) {
      webView.current.injectJavaScript(closeInjectedScript(injectJs));
    }
  };

  if (error) {
    return (
      <ErrorComponent
        onRetry={() => {
          dispatch({ kind: "retry" });
          setLollipopCheckStatus({ status: "none", url: O.none });
          startLoginProcess();
        }}
        onClose={props.onClose}
      />
    );
  }

  const WithLoading = withLoadingSpinner(() => (
    <View style={IOStyles.flex}>
      {authUrl === undefined && (
        <WebView
          androidCameraAccessDisabled={true}
          androidMicrophoneAccessDisabled={true}
          ref={webView}
          userAgent={userAgent}
          javaScriptEnabled={true}
          injectedJavaScript={injectJs}
          onLoadEnd={handleOnLoadEnd}
          onError={handleOnError}
          onShouldStartLoadWithRequest={handleOnShouldStartLoadWithRequest}
          source={webviewSource}
          onNavigationStateChange={handleNavigationStateChange}
          key={key}
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

const handleNavigationStateChange = (event: WebViewNavigation): void => {
  if (event.url) {
    // TODO: - act the same way as https://github.com/pagopa/io-app/pull/4351
    console.log("✅👀 " + userAgent);
    console.log("✅🚀 " + event.url);
  }
};

const ErrorComponent = (
  props: { onRetry: () => void } & Pick<Props, "onClose">
) => (
  <GenericErrorComponent
    avoidNavigationEvents={true}
    onRetry={props.onRetry}
    onCancel={props.onClose}
    image={require("../../../img/broken-link.png")} // TODO: use custom or generic image?
    text={I18n.t("authentication.errors.network.title")} // TODO: use custom or generic text?
  />
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
