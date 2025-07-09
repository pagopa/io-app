import { createRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import WebView, {
  WebViewMessageEvent,
  WebViewNavigation
} from "react-native-webview";
import { pipe } from "fp-ts/lib/function";
import { ItwCieMachineContext } from "../machine/cie/provider";
import {
  selectAuthenticationUrl,
  selectAuthorizationUrl
} from "../machine/cie/selectors";
import { selectItwEnv } from "../../common/store/selectors/environment";
import { useIOSelector } from "../../../../store/hooks";
import { getEnv } from "../../common/utils/environment";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import I18n from "../../../../i18n";

const iOSUserAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1";
const defaultUserAgent = Platform.select({
  ios: iOSUserAgent,
  default: undefined
});

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

/**
 * Webview used to fetch the authentication url to use a servide provider for the CIE authentication
 * It displayes a loading spinner, with the webview working in the background
 */
export const ItwCieAuthenticationWebview = () => {
  const webView = createRef<WebView>();
  const actor = ItwCieMachineContext.useActorRef();
  const authenticationUrl = ItwCieMachineContext.useSelector(
    selectAuthenticationUrl
  );

  const handleMessage = async (event: WebViewMessageEvent) => {
    const url = event.nativeEvent.data;
    actor.send({ type: "set-service-provider-url", url });
  };

  return (
    <>
      <WebView
        ref={webView}
        userAgent={defaultUserAgent}
        javaScriptEnabled={true}
        injectedJavaScript={injectedJavaScript}
        source={{ uri: authenticationUrl }}
        onMessage={handleMessage}
      />
      <View style={styles.overlay}>
        <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")} />
      </View>
    </>
  );
};

/**
 * Webview used to display to the user the authorization request after the CIE authentication
 */
export const ItwCieAuthorizationWebview = () => {
  const webView = createRef<WebView>();
  const actor = ItwCieMachineContext.useActorRef();
  const authorizationUrl = ItwCieMachineContext.useSelector(
    selectAuthorizationUrl
  );
  const { ISSUANCE_REDIRECT_URI } = pipe(useIOSelector(selectItwEnv), getEnv);

  const handleShouldStartLoadWithRequest = (
    event: WebViewNavigation
  ): boolean => {
    if (event.url.includes(ISSUANCE_REDIRECT_URI)) {
      actor.send({ type: "complete-authentication", redirectUrl: event.url });
      return false;
    } else {
      return true;
    }
  };

  return (
    <WebView
      ref={webView}
      userAgent={defaultUserAgent}
      javaScriptEnabled={true}
      source={{ uri: authorizationUrl || "" }}
      onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
    />
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  }
});
