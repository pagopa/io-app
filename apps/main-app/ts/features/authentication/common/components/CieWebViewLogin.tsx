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
import { trackLoginOIConfigurationError } from "../../common/analytics";
import {
  isOneIdentityErrorUrl,
  LOGIN_TYPES,
  onLoginUriChanged
} from "../utils";
import { defaultUserAgent, originSchemasWhiteList } from "../utils/cie";
import { LoginType } from "../utils/index";
import { getWebViewFailure, LoginFailure } from "../utils/loginFailure";

export type CieWebViewLoginProps = {
  /** The login flow this WebView is part of. */
  flow?: LoginType;
  /** Called when the login fails, whatever the cause. */
  onFailure: (failure: LoginFailure) => void;
  /** Called with the session token when the login succeeds. */
  onSuccess: (token: string) => void;
  /** The URL to load in the WebView. */
  url: string;
};

export const CieWebViewLogin = memo(
  ({
    url,
    onFailure,
    onSuccess,
    flow = LOGIN_TYPES.AUTH
  }: CieWebViewLoginProps) => {
    const handleOnShouldStartLoadWithRequest = useCallback(
      (event: WebViewNavigation): boolean => {
        if (isOneIdentityErrorUrl(event.url)) {
          trackLoginOIConfigurationError(event.url, flow);
        }

        const bearerTokenFoundInUrl = onLoginUriChanged(
          onFailure,
          onSuccess,
          "cie",
          flow
        )(event);

        // URL can be loaded if it's not containing the token
        return !bearerTokenFoundInUrl;
      },
      [onFailure, onSuccess, flow]
    );

    const handleWebViewError = useCallback(
      (event: WebViewErrorEvent | WebViewHttpErrorEvent): void => {
        onFailure(getWebViewFailure(event));
      },
      [onFailure]
    );

    return (
      <SafeAreaView edges={["bottom"]} style={styles.container}>
        <WebView
          androidCameraAccessDisabled={true}
          androidMicrophoneAccessDisabled={true}
          javaScriptEnabled={true}
          onError={handleWebViewError}
          onHttpError={handleWebViewError}
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
    flex: 1
  }
});

const CieWebViewLoginLoading = () => (
  <View style={StyleSheet.absoluteFill}>
    <LoadingScreenContent title={I18n.t("global.genericWaiting")} />
  </View>
);
