import React, { createRef } from "react";
import { Platform } from "react-native";
import { WebView } from "react-native-webview";
import type {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewMessageEvent,
  WebViewNavigation,
  WebViewNavigationEvent
} from "react-native-webview/lib/WebViewTypes";
import { CieError, CieErrorType } from "./error";
import { CieEvent } from "./event";
import { startCieAndroid, startCieiOS, type ContinueWithUrl } from "./manager";

const AUTH_LINK_PATTERN = "lettura carta";

/* To obtain the authentication URL on CIE L3 it is necessary to take the
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

export type OnCieSuccess = (url: string) => void;
export type OnCieError = (e: CieError) => void;
export type OnCieEvent = (e: CieEvent) => void;

type WebViewComponentProps = {
  authUrl: string;
  onSuccess: OnCieSuccess;
  onError: OnCieError;
  pin: string;
  useUat: boolean;
  redirectUrl: string;
  onEvent: OnCieEvent;
};

/*
 * To make sure the server recognizes the client as valid iPhone device (iOS only) we use a custom header
 * on Android it is not required.
 */
const iOSUserAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";
const defaultUserAgent = Platform.select({
  ios: iOSUserAgent,
  default: undefined
});

const webView = createRef<WebView>();

/**
 * WebViewComponent
 *
 * Component that manages authentication via CIE L3 (NFC+PIN) based on WebView (react-native-webview).
 * In particular, once rendered, it makes a series of calls to the authUrl in the WebView,
 * extrapolates the authentication URL necessary for CieManager to sign via certificate
 * and calls the CIE SDK which is responsible for starting card reading via NFC.
 * At the end of the reading, a redirect is made in the WebView towards the page that asks
 * the user for consent to send the data to the Service Provider. This moment can be captured
 * via the onUserInteraction parameter. When the user allows or denies their consent,
 * a redirect is made to the URL set by the Service Provider.
 * This url can be configured using the redirectUrl parameter which allows you to close the WebView.
 * The event can then be captured via the onSuccess parameter.
 *
 * @param {WebViewComponentProps} props - Parameters required by the component.
 * @param {string} params.authUrl -The authentication URL of the Service Provider to which to authenticate.
 * @param {boolean} params.useUat - If set to true it uses the CIE testing environment.
 * @param {string} params.pin - CIE pin for use with NFC reading.
 * @param {Function} params.onError - Callback function in case of error. The function is passed the Error parameter.
 * @param {Function} params.onSuccess - Callback at the end of authentication to which the redirect URL including parameters is passed.
 * @param {string} params.redirectUrl - Redirect URL set by the Service Provider. It is used to stop the flow and return to the calling function via onSuccess.
 * @param {Function} params.onEvent - Callback function that is called whenever there is a new CieEvent from the CIE reader.
 * @returns {JSX.Element} - The configured component with WebView.
 */
export const WebViewComponent = (props: WebViewComponentProps) => {
  const [webViewUrl, setWebViewUrl] = React.useState(props.authUrl);
  const [isCardReadingFinished, setCardReadingFinished] = React.useState(false);
  const cieCompletedEventEmitted = React.useRef(false);

  /*
   * Once the reading of the card with NFC is finished, it is necessary
   * to change the URL of the WebView by redirecting to the URL returned by
   * CieManager to allow the user to continue with the consent authorization
   * */
  const continueWithUrl: ContinueWithUrl = (callbackUrl: string) => {
    setCardReadingFinished(true);
    setWebViewUrl(callbackUrl);
  };

  // This function is called from the injected javascript code (postMessage). Which receives the authentication URL
  const handleMessage = async (event: WebViewMessageEvent) => {
    const cieAuthorizationUri = event.nativeEvent.data;
    const startCie = Platform.select({
      ios: startCieiOS,
      default: startCieAndroid
    });
    await startCie(
      props.useUat,
      props.pin,
      props.onError,
      props.onEvent,
      cieAuthorizationUri,
      continueWithUrl
    );
  };

  // This function is called when authentication with CIE ends and the SP URL containing code and state is returned
  const handleShouldStartLoading =
    (onSuccess: OnCieSuccess, redirectUrl: string) =>
    (event: WebViewNavigation): boolean => {
      if (isCardReadingFinished && event.url.includes(redirectUrl)) {
        onSuccess(event.url);
        return false;
      } else {
        return true;
      }
    };

  const handleOnLoadEnd =
    (onError: OnCieError, onCieEvent: OnCieEvent) =>
    (e: WebViewNavigationEvent | WebViewErrorEvent) => {
      const eventTitle = e.nativeEvent.title.toLowerCase();
      if (
        eventTitle === "pagina web non disponibile" ||
        // On Android, if we attempt to access the idp URL twice,
        // we are presented with an error page titled "ERROR".
        eventTitle === "errore"
      ) {
        handleOnError(onError)(new Error(eventTitle));
      }

      /**
       * At the end of loading the page, if the card has already been read
       * then the WebView has loaded the page to ask the user for consent,
       * so send the completed event.
       * The ref here prevents the "read completed" event being fired multiple times
       * when the webview finishes loading the second url.
       */
      if (isCardReadingFinished && !cieCompletedEventEmitted.current) {
        onCieEvent(CieEvent.completed);
        // eslint-disable-next-line functional/immutable-data
        cieCompletedEventEmitted.current = true;
      }
    };

  const handleOnError =
    (onError: OnCieError) =>
    (e: WebViewErrorEvent | WebViewHttpErrorEvent | Error): void => {
      const error = e as Error;
      const webViewError = e as WebViewErrorEvent;
      const webViewHttpError = e as WebViewHttpErrorEvent;
      if (webViewHttpError.nativeEvent.statusCode) {
        const { description, statusCode } = webViewHttpError.nativeEvent;
        onError(
          new CieError({
            message: `WebView http error: ${description} with status code: ${statusCode}`,
            type: CieErrorType.WEB_VIEW_ERROR
          })
        );
      } else if (webViewError.nativeEvent) {
        const { code, description } = webViewError.nativeEvent;
        onError(
          new CieError({
            message: `WebView error: ${description} with code: ${code}`,
            type: CieErrorType.WEB_VIEW_ERROR
          })
        );
      } else if (error.message !== undefined) {
        onError(
          new CieError({
            message: `${error.message}`,
            type: CieErrorType.WEB_VIEW_ERROR
          })
        );
      } else {
        onError(
          new CieError({
            message: "An error occurred in the WebView",
            type: CieErrorType.WEB_VIEW_ERROR
          })
        );
      }
    };

  return (
    <WebView
      ref={webView}
      userAgent={defaultUserAgent}
      javaScriptEnabled={true}
      source={{ uri: webViewUrl }}
      onLoadEnd={handleOnLoadEnd(props.onError, props.onEvent)}
      onError={handleOnError(props.onError)}
      onHttpError={handleOnError(props.onError)}
      injectedJavaScript={injectedJavaScript}
      onShouldStartLoadWithRequest={handleShouldStartLoading(
        props.onSuccess,
        props.redirectUrl
      )}
      onMessage={handleMessage}
    />
  );
};
