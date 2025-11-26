import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { ComponentProps, createRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import WebView, {
  WebViewMessageEvent,
  WebViewNavigation
} from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewNavigationEvent
} from "react-native-webview/lib/WebViewTypes";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import { useIOSelector } from "../../../../../store/hooks";
import { selectItwEnv } from "../../../common/store/selectors/environment";
import { getEnv } from "../../../common/utils/environment";
import { WebViewError } from "../utils/error";

const iOSUserAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";
const defaultUserAgent = Platform.select({
  ios: iOSUserAgent,
  default: undefined
});

const AUTH_LINK_PATTERN = "lettura carta";

/**
 * To obtain the authentication URL on CIE L3 it is necessary to take the
 * link contained in the "Entra con lettura carta CIE" button.
 * This link can then be used on CieManager.
 * This javascript code takes the link in question and sends it to the react native function via postMessage
 */
const injectedJavaScript = `
    (function() {
      function sendDocumentContent() {
        const idpAuthUrl = [...document.querySelectorAll("a")]
        .filter(a => a.textContent.toLowerCase().includes("${AUTH_LINK_PATTERN}"))
        .map(a=>a.href)[0];

        if(idpAuthUrl) {
          window.ReactNativeWebView.postMessage(idpAuthUrl);
        }
      }
      if (document.readyState === 'complete') {
        sendDocumentContent();
      } else {
        window.addEventListener('load', sendDocumentContent);
      }
    })();
    true;
  `;

const isL3AuthUrl = (url: string) =>
  Platform.OS === "ios"
    ? url.includes("authnRequestString")
    : url.includes("OpenApp");

type ItwCieWebViewProps = ComponentProps<typeof WebView> & {
  onWebViewError: (error: WebViewError) => void;
};

/**
 * Base WebView component used for the CIE flow
 */
const ItwCieWebView = ({ onWebViewError, ...props }: ItwCieWebViewProps) => {
  const webView = createRef<WebView>();

  const handleOnError = (
    err: WebViewErrorEvent | WebViewHttpErrorEvent | Error
  ): void =>
    pipe(
      err,
      e => {
        const error = e as Error;
        const webViewError = e as WebViewErrorEvent;
        const webViewHttpError = e as WebViewHttpErrorEvent;
        if (webViewHttpError.nativeEvent?.statusCode) {
          const { description, statusCode } = webViewHttpError.nativeEvent;
          return `WebView http error: ${description} with status code: ${statusCode}`;
        } else if (webViewError.nativeEvent) {
          const { code, description } = webViewError.nativeEvent;
          return `WebView error: ${description} with code: ${code}`;
        } else {
          return error.message || "An error occurred in the WebView";
        }
      },
      message =>
        onWebViewError({
          name: "WEBVIEW_ERROR",
          message
        })
    );

  const handleOnLoadEnd = (e: WebViewNavigationEvent | WebViewErrorEvent) => {
    const eventTitle = e.nativeEvent.title.toLowerCase();
    if (
      eventTitle === "pagina web non disponibile" ||
      // On Android, if we attempt to access the idp URL twice,
      // we are presented with an error page titled "ERROR".
      eventTitle.includes("errore")
    ) {
      handleOnError(new Error(eventTitle));
    }
  };

  return (
    <WebView
      {...props}
      ref={webView}
      userAgent={defaultUserAgent}
      javaScriptEnabled={true}
      injectedJavaScript={injectedJavaScript}
      onLoadEnd={handleOnLoadEnd}
      onError={handleOnError}
      onHttpError={handleOnError}
    />
  );
};

type ItwCieAuthenticationWebviewProps = {
  authenticationUrl: string;
  onServiceProviderUrlReceived: (url: string) => void;
  onWebViewError: (error: WebViewError) => void;
};

/**
 * Webview used to fetch the authentication url to use a servide provider for the CIE authentication
 * It displayes a loading spinner, with the webview working in the background
 */
export const ItwCieAuthenticationWebview = ({
  authenticationUrl,
  onServiceProviderUrlReceived,
  onWebViewError
}: ItwCieAuthenticationWebviewProps) => {
  const handleMessage = async (event: WebViewMessageEvent) => {
    const url = event.nativeEvent.data;
    onServiceProviderUrlReceived(url);
  };

  const handleShouldStartLoadWithRequest = (
    event: WebViewNavigation
  ): boolean => {
    // When authenticating with L3 directly, the injected JS does not work so `handleMessage` is never called
    // To continue we must take the url with `OpenApp` (Android) or `authnRequestString` (iOS)
    if (isL3AuthUrl(event.url)) {
      void handleMessage({
        nativeEvent: { data: event.url }
      } as WebViewMessageEvent);
      return false;
    }

    return true;
  };

  return (
    <>
      {authenticationUrl && (
        <ItwCieWebView
          source={{ uri: authenticationUrl }}
          onMessage={handleMessage}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onWebViewError={onWebViewError}
        />
      )}
      <View style={StyleSheet.absoluteFillObject}>
        <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")} />
      </View>
    </>
  );
};

type ItwCieAuthorizationWebviewProps = {
  authorizationUrl: string;
  onAuthorizationComplete: (redirectUrl: string) => void;
  onWebViewError: (error: WebViewError) => void;
};

/**
 * Webview used to display to the user the authorization request after the CIE authentication
 */
export const ItwCieAuthorizationWebview = ({
  authorizationUrl,
  onAuthorizationComplete,
  onWebViewError
}: ItwCieAuthorizationWebviewProps) => {
  const { ISSUANCE_REDIRECT_URI } = pipe(useIOSelector(selectItwEnv), getEnv);

  const handleShouldStartLoadWithRequest = (
    event: WebViewNavigation
  ): boolean => {
    if (event.url.includes(ISSUANCE_REDIRECT_URI)) {
      onAuthorizationComplete(event.url);
      return false;
    } else {
      return true;
    }
  };

  return (
    <ItwCieWebView
      source={{ uri: authorizationUrl }}
      onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      onWebViewError={onWebViewError}
    />
  );
};
