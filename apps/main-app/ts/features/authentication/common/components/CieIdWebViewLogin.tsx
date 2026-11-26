import { memo, useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import WebView, { type WebViewNavigation } from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent
} from "react-native-webview/lib/WebViewTypes";

import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { useIOStore } from "../../../../store/hooks";
import { useOneIdentityLoginSource } from "../../../lollipop/hooks/useOneIdentityLoginSource";
import { trackLoginOIConfigurationError } from "../../common/analytics";
import { LoadingOverlay } from "../../login/cie/shared/LoadingSpinnerOverlay";
import {
  CieEnv,
  getCieIdpId,
  isAuthenticationUrl
} from "../../login/cie/utils";
import { useCieIdApp } from "../hooks/useCieIdApp";
import { oneIdentityAllowedCieOriginsSelector } from "../store/selectors/remoteConfig";
import {
  AUTH_LEVELS,
  isOneIdentityErrorUrl,
  LOGIN_TYPES,
  onLoginUriChanged
} from "../utils";
import {
  defaultUserAgent,
  isAllowedUrl,
  originSchemasWhiteList
} from "../utils/cie";
import { LoginType } from "../utils/index";
import { getWebViewFailure, LoginFailure } from "../utils/loginFailure";

export type CieIdWebViewLoginProps = {
  /** The CIE environment to authenticate against. */
  cieEnv: CieEnv;
  /** The login flow this WebView is part of; defaults to a first-time login. */
  flow?: LoginType;
  /** Called when the login fails, whatever the cause. */
  onFailure: (failure: LoginFailure) => void;
  /** Called with the session token when the login succeeds. */
  onSuccess: (token: string) => void;
};

export const CieIdWebViewLogin = memo(
  ({
    flow = LOGIN_TYPES.AUTH,
    cieEnv,
    onFailure,
    onSuccess
  }: CieIdWebViewLoginProps) => {
    const [authenticatedUrl, setAuthenticatedUrl] = useState<null | string>(
      null
    );
    const store = useIOStore();

    const handleAuthenticationSuccess = useCallback(
      (url: string) => {
        const allowedCieOrigins = oneIdentityAllowedCieOriginsSelector(
          store.getState()
        );
        if (!isAllowedUrl(url, allowedCieOrigins)) {
          onFailure({ kind: "cieIdUrlNotAllowed", details: { url } });
          return;
        }
        setAuthenticatedUrl(url);
      },
      [store, onFailure]
    );

    const { startCieIdApp } = useCieIdApp({
      onFailure,
      onSuccess: handleAuthenticationSuccess,
      cieEnv
    });

    const { loginSourceState, shouldBlockUrlNavigationWhileCheckingLollipop } =
      useOneIdentityLoginSource({
        flow,
        idpId: getCieIdpId(cieEnv),
        onFailure,
        minAuthLevel: AUTH_LEVELS.L2
      });

    const handleOnShouldStartLoadWithRequest = useCallback(
      (event: WebViewNavigation): boolean => {
        const url = event.url;

        if (isOneIdentityErrorUrl(url)) {
          trackLoginOIConfigurationError(url, flow);
        }

        if (shouldBlockUrlNavigationWhileCheckingLollipop(url)) {
          return false;
        }

        if (isAuthenticationUrl(url)) {
          startCieIdApp(url);
          return false;
        }

        const isLoginUrlWithToken = onLoginUriChanged(
          onFailure,
          onSuccess,
          "cieid",
          flow
        )(event);

        // URL can be loaded if it's not containing the token
        return !isLoginUrlWithToken;
      },
      [
        shouldBlockUrlNavigationWhileCheckingLollipop,
        startCieIdApp,
        onFailure,
        onSuccess,
        flow
      ]
    );

    const handleWebViewError = useCallback(
      (event: WebViewErrorEvent | WebViewHttpErrorEvent): void => {
        onFailure(getWebViewFailure(event));
      },
      [onFailure]
    );

    const handleCancel = useCallback(() => {
      onFailure({ kind: "cancelled", details: {} });
    }, [onFailure]);

    if (loginSourceState.status === "failure") {
      return null;
    }

    // The overlay covers the waits before the WebView has a source. The
    // assertion-ref check is local and takes a few milliseconds, so the overlay
    // stays off meanwhile to avoid a flash, and the WebView stays mounted: a new
    // incognito instance would lose the OneIdentity session cookie.
    const isLoading =
      loginSourceState.status === "reserving-public-key" ||
      loginSourceState.status === "following-redirects";

    const webviewSource = isLoading
      ? undefined
      : authenticatedUrl
        ? { uri: authenticatedUrl }
        : loginSourceState.webviewSource;

    return (
      <LoadingSpinnerOverlay isLoading={isLoading} onCancel={handleCancel}>
        {webviewSource && (
          <WebView
            androidCameraAccessDisabled
            androidMicrophoneAccessDisabled
            incognito
            onError={handleWebViewError}
            onHttpError={handleWebViewError}
            onShouldStartLoadWithRequest={handleOnShouldStartLoadWithRequest}
            originWhitelist={originSchemasWhiteList}
            renderLoading={() => <LoadingOverlay onCancel={handleCancel} />}
            source={webviewSource}
            startInLoadingState={true}
            style={styles.container}
            testID="cie-id-webview"
            userAgent={defaultUserAgent}
          />
        )}
      </LoadingSpinnerOverlay>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
