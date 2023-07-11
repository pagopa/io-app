import { View } from "native-base";
import * as React from "react";
import { createRef, useEffect, useReducer } from "react";
import { Platform } from "react-native";
import WebView from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewNavigation,
  WebViewNavigationEvent
} from "react-native-webview/lib/WebViewTypes";
import I18n from "../../../../i18n";
import { closeInjectedScript } from "../../../../utils/webview";
import { withLoadingSpinner } from "../../../../components/helpers/withLoadingSpinner";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { getIdpLoginUri } from "../../../../utils/login";
import GenericErrorComponent from "../../../../components/screens/GenericErrorComponent";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";

// to make sure the server recognizes the client as valid iPhone device (iOS only) we use a custom header
// on Android it is not required
const iOSUserAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";
const userAgent = Platform.select({ ios: iOSUserAgent, default: undefined });

// INFA PROD -> xx_servizicie
// INFRA DEV -> xx_servizicie_test
const CIE_IDP_ID = "xx_servizicie";

/**
 * This JS is injection on every page load. It tries to decrease to 0 the sleeping time of a script.
 * That sleeping is used to allow user to read page content until the content changes to an automatic redirect.
 * This script also tries also to call apriIosUL.
 * If it is defined it starts the authentication process (iOS only).
 */
const injectJs = `
  seconds = 0;
  if(apriIosUL !== undefined){
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
  | { kind: "retry" };

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

  useEffect(() => {
    if (authUrl !== undefined) {
      onSuccess(authUrl);
    }
  }, [authUrl, onSuccess]);

  const handleOnShouldStartLoadWithRequest = (
    event: WebViewNavigation
  ): boolean => {
    if (authUrl !== undefined) {
      return false;
    }
    // on iOS when authnRequestString is present in the url, it means we have all stuffs to go on.
    if (
      event.url !== undefined &&
      Platform.OS === "ios" &&
      event.url.indexOf("authnRequestString") !== -1
    ) {
      // avoid redirect and follow the 'happy path'
      if (webView.current !== null) {
        dispatch({
          kind: "foundAuthUrl",
          authUrl: event.url
        });
      }
      return false;
    }

    // Once the returned url contains the "OpenApp" string, then the authorization has been given
    if (event.url && event.url.indexOf("OpenApp") !== -1) {
      dispatch({ kind: "foundAuthUrl", authUrl: event.url });
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
    // inject JS on every page load end
    if (webView.current) {
      webView.current.injectJavaScript(closeInjectedScript(injectJs));
    }
  };

  if (error) {
    return (
      <ErrorComponent
        onRetry={() => dispatch({ kind: "retry" })}
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
          source={{
            uri: getIdpLoginUri(CIE_IDP_ID, 3)
          }}
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

const ErrorComponent = (
  props: { onRetry: () => void } & Pick<Props, "onClose">
) => (
  <GenericErrorComponent
    avoidNavigationEvents={true}
    onRetry={props.onRetry}
    onCancel={props.onClose}
    image={require("../../../../../img/broken-link.png")} // TODO: use custom or generic image?
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
