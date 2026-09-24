import I18n from "i18next";
import { memo, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView, { type WebViewNavigation } from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent
} from "react-native-webview/lib/WebViewTypes";

import { LoadingScreenContent } from "../../../../components/screens/LoadingScreenContent";
import { LoginType } from "../../activeSessionLogin/screens/analytics";
import { onLoginUriChanged } from "../utils";
import { defaultUserAgent, originSchemasWhiteList } from "../utils/cie";

export type CieWebViewLoginEvent =
  | {
      payload: { code?: string; message?: string; reason: string };
      type: "LOGIN_FAILURE";
    }
  | {
      payload: { statusCode: number; url: string };
      type: "WEBVIEW_HTTP_ERROR";
    }
  | { payload: { token: string }; type: "LOGIN_SUCCESS" }
  | { payload: { url: string }; type: "WEBVIEW_ERROR" };

export type CieWebViewLoginProps = {
  /** The login flow this WebView is part of. */
  flow?: LoginType;
  /** Callback invoked for various authentication-related events. */
  onEvent: (event: CieWebViewLoginEvent) => void;
  /** The URL to load in the WebView. */
  url: string;
};

export const CieWebViewLogin = memo(
  ({ url, onEvent, flow = "auth" }: CieWebViewLoginProps) => {
    const handleLoginSuccess = useCallback(
      (token: string) => {
        onEvent({ type: "LOGIN_SUCCESS", payload: { token } });
      },
      [onEvent]
    );

    const handleLoginFailure = useCallback(
      (code?: string, message?: string) => {
        const reason = code
          ? `login failed with code ${code}`
          : message
            ? `login failed with message ${message}`
            : "login failed with no error code or message available";

        onEvent({
          type: "LOGIN_FAILURE",
          payload: { code, message, reason }
        });
      },
      [onEvent]
    );

    const handleOnShouldStartLoadWithRequest = useCallback(
      (event: WebViewNavigation): boolean => {
        const bearerTokenFoundInUrl = onLoginUriChanged(
          handleLoginFailure,
          handleLoginSuccess,
          "cie",
          flow
        )(event);

        // URL can be loaded if it's not containing the token
        return !bearerTokenFoundInUrl;
      },
      [handleLoginFailure, handleLoginSuccess, flow]
    );

    const handleError = useCallback(
      (event: WebViewErrorEvent | WebViewHttpErrorEvent): void => {
        const { nativeEvent } = event;

        if ("statusCode" in nativeEvent) {
          onEvent({
            type: "WEBVIEW_HTTP_ERROR",
            payload: {
              url: nativeEvent.url,
              statusCode: nativeEvent.statusCode
            }
          });
          return;
        }

        onEvent({
          type: "WEBVIEW_ERROR",
          payload: { url: nativeEvent.url }
        });
      },
      [onEvent]
    );

    return (
      <SafeAreaView edges={["bottom"]} style={styles.container}>
        <WebView
          androidCameraAccessDisabled={true}
          androidMicrophoneAccessDisabled={true}
          javaScriptEnabled={true}
          onError={handleError}
          onHttpError={handleError}
          onShouldStartLoadWithRequest={handleOnShouldStartLoadWithRequest}
          originWhitelist={originSchemasWhiteList}
          renderLoading={CieWebViewLoginLoading}
          source={{ uri: url }}
          startInLoadingState={true}
          testID="cie-webview"
          textZoom={100}
          userAgent={defaultUserAgent}
        />
      </SafeAreaView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 16
  }
});

const CieWebViewLoginLoading = () => (
  <View style={StyleSheet.absoluteFill}>
    <LoadingScreenContent title={I18n.t("global.genericWaiting")} />
  </View>
);
