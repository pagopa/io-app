import { memo, useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView, { type WebViewNavigation } from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent
} from "react-native-webview/lib/WebViewTypes";

import { useOneIdentityLoginSource } from "../../../lollipop/hooks/useOneIdentityLoginSource";
import { LoginType } from "../../activeSessionLogin/screens/analytics";
import { LoadingOverlay } from "../../login/cie/shared/LoadingSpinnerOverlay";
import { getCieIdpId, isAuthenticationUrl } from "../../login/cie/utils";
import { useCieIdApp } from "../hooks/useCieIdApp";
import { AUTH_LEVELS, onLoginUriChanged } from "../utils";
import {
  defaultUserAgent,
  isAllowedUrl,
  originSchemasWhiteList
} from "../utils/cie";

export type CieIdWebViewLoginEvent =
  | {
      payload: { code?: string; message?: string; reason: string };
      type: "LOGIN_FAILURE";
    }
  | {
      payload: { reason: string };
      type: "ONE_IDENTITY_LOGIN_FAILURE";
    }
  | {
      payload: { statusCode: number; url: string };
      type: "WEBVIEW_HTTP_ERROR";
    }
  | { payload: { token: string }; type: "LOGIN_SUCCESS" }
  | { payload: { url: string }; type: "NOT_ALLOWED_URL" }
  | { payload: { url: string }; type: "WEBVIEW_ERROR" }
  | { type: "CANCEL" };

export type CieIdWebViewLoginProps = {
  /** The login flow this WebView is part of; defaults to a first-time login. */
  flow?: LoginType;
  /** Indicates whether the environment is UAT. */
  isUat: boolean;
  /** Callback invoked for various authentication-related events. */
  onEvent: (event: CieIdWebViewLoginEvent) => void;
};

export const CieIdWebViewLogin = memo(
  ({ flow = "auth", isUat, onEvent }: CieIdWebViewLoginProps) => {
    const [authenticatedUrl, setAuthenticatedUrl] = useState<null | string>(
      null
    );

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

    const handleAuthenticationSuccess = useCallback(
      (url: string) => {
        if (!isAllowedUrl(url)) {
          onEvent({ type: "NOT_ALLOWED_URL", payload: { url } });
          return;
        }
        setAuthenticatedUrl(url);
      },
      [onEvent]
    );

    const { startCieIdApp } = useCieIdApp({
      onFailure: handleLoginFailure,
      onSuccess: handleAuthenticationSuccess,
      useUat: isUat
    });

    const handleFailure = useCallback(
      (reason: string) => {
        onEvent({
          type: "ONE_IDENTITY_LOGIN_FAILURE",
          payload: { reason }
        });
      },
      [onEvent]
    );

    const { loginSourceState, shouldBlockUrlNavigationWhileCheckingLollipop } =
      useOneIdentityLoginSource({
        idpId: getCieIdpId(isUat),
        onFailure: handleFailure,
        minAuthLevel: AUTH_LEVELS.L2
      });

    const handleOnShouldStartLoadWithRequest = useCallback(
      (event: WebViewNavigation): boolean => {
        const url = event.url;

        if (shouldBlockUrlNavigationWhileCheckingLollipop(url)) {
          return false;
        }

        if (isAuthenticationUrl(url)) {
          startCieIdApp(url);
          return false;
        }

        const isLoginUrlWithToken = onLoginUriChanged(
          handleLoginFailure,
          handleLoginSuccess,
          "cieid",
          flow
        )(event);

        // URL can be loaded if it's not the login URL containing the session token - this avoids
        // making a (useless) GET request with the session in the URL
        return !isLoginUrlWithToken;
      },
      [
        shouldBlockUrlNavigationWhileCheckingLollipop,
        startCieIdApp,
        handleLoginFailure,
        handleLoginSuccess,
        flow
      ]
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

    const handleCancel = useCallback(() => {
      onEvent({ type: "CANCEL" });
    }, [onEvent]);

    if (
      loginSourceState.status === "reserving-public-key" ||
      loginSourceState.status === "verifying-assertion-ref"
    ) {
      return <LoadingOverlay onCancel={handleCancel} />;
    }

    if (loginSourceState.status === "failure") {
      return null;
    }

    const webviewSource = authenticatedUrl
      ? { uri: authenticatedUrl }
      : loginSourceState.webviewSource;

    return (
      <SafeAreaView edges={["bottom"]} style={styles.container}>
        <WebView
          onError={handleError}
          onHttpError={handleError}
          onShouldStartLoadWithRequest={handleOnShouldStartLoadWithRequest}
          originWhitelist={originSchemasWhiteList}
          renderLoading={() => <LoadingOverlay onCancel={handleCancel} />}
          source={webviewSource}
          startInLoadingState={true}
          testID="cie-id-webview"
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
