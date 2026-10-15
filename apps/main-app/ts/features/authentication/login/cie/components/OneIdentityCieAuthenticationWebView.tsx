import I18n from "i18next";
import { useCallback, useMemo, useState } from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewNavigation,
  WebViewNavigationEvent
} from "react-native-webview/lib/WebViewTypes";

import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../../store/hooks";
import { trackLoginError } from "../../../../../utils/analytics";
import {
  OneIdentityLoginSourceError,
  useOneIdentityLoginSource
} from "../../../../lollipop/hooks/useOneIdentityLoginSource";
import { oneIdentityCieNativeRedirectsEnabledSelector } from "../../../common/store/selectors/remoteConfig";
import { AUTH_LEVELS, onLoginUriChanged } from "../../../common/utils";
import { defaultUserAgent } from "../../../common/utils/cie";
import { LoginType } from "../../../common/utils/index";
import {
  getLoginFailureDebugInfo,
  LoginFailure
} from "../../../common/utils/loginFailureDebugInfo";
import { isCieLoginUatEnabledSelector } from "../store/selectors";
import { getCieIdpId } from "../utils";

/**
 * Checks if a given URL is an authentication URL.
 *
 * @param url The URL to check if it is an authentication URL.
 * @returns `true` if the URL is an authentication URL, `false` otherwise.
 */
const isAuthUrl = (url: string) =>
  Platform.select({
    ios: url.includes("authnRequestString"),
    default: url.includes("OpenApp")
  });

/**
 * Checks if a given page title corresponds to an error page.
 *
 * @param title The page title to check.
 * @returns `true` if the page title corresponds to an error page, `false`
 *   otherwise.
 */
const isErrorPage = (title?: string): title is string => {
  if (!title) {
    return false;
  }
  const ERROR_PAGE_TITLES = ["pagina web non disponibile", "errore"];
  return ERROR_PAGE_TITLES.includes(title.toLowerCase());
};

export type OneIdentityCieAuthenticationWebViewProps = {
  flow: LoginType;
  onAuthenticationUrlReceived: (url: string) => void;
};

type WebViewState =
  | { failure: LoginFailure; status: "failure" }
  | { status: "authenticating" };

export const OneIdentityCieAuthenticationWebView = ({
  flow,
  onAuthenticationUrlReceived
}: OneIdentityCieAuthenticationWebViewProps) => {
  const navigation = useIONavigation();

  const useUat = useIOSelector(isCieLoginUatEnabledSelector);
  const followRedirectsNatively = useIOSelector(
    oneIdentityCieNativeRedirectsEnabledSelector
  );

  const [webViewState, setWebViewState] = useState<WebViewState>({
    status: "authenticating"
  });

  /**
   * @param reason The failure description sent to analytics.
   * @param failure The failure details shown in debug mode.
   */
  const handleFailure = useCallback((reason: string, failure: LoginFailure) => {
    setWebViewState({ status: "failure", failure });
    trackLoginError("cie", new Error(reason));
  }, []);

  const handleLoginSourceFailure = useCallback(
    (error: OneIdentityLoginSourceError) =>
      handleFailure(error.message, {
        type: "ONE_IDENTITY_LOGIN_FAILURE",
        payload: { error }
      }),
    [handleFailure]
  );

  const {
    loginSourceState,
    shouldBlockUrlNavigationWhileCheckingLollipop,
    generateLoginSource
  } = useOneIdentityLoginSource({
    flow,
    followRedirectsNatively,
    idpId: getCieIdpId(useUat),
    onFailure: handleLoginSourceFailure,
    minAuthLevel: AUTH_LEVELS.L3
  });

  const handleLoadEnd = (event: WebViewErrorEvent | WebViewNavigationEvent) => {
    const { title, url } = event.nativeEvent;

    if (isErrorPage(title)) {
      handleFailure(title, { type: "ERROR_PAGE", payload: { title, url } });
      return;
    }
  };

  const handleLoginFailure = useCallback(
    (code?: string, message?: string) => {
      const reason = `Login failed with code (${code}) and message (${message})`;
      handleFailure(reason, {
        type: "LOGIN_FAILURE",
        payload: { code, message }
      });
    },
    [handleFailure]
  );

  const handleShouldStartLoadWithRequest = useCallback(
    (event: WebViewNavigation): boolean => {
      const url = event.url;

      if (shouldBlockUrlNavigationWhileCheckingLollipop(url)) {
        return false;
      }

      // Check if the URL is an authentication URL
      if (isAuthUrl(url)) {
        onAuthenticationUrlReceived(url);
        return false;
      }

      // At this stage of the login flow, we only monitor the URL for potential errors.
      // The success callback is intentionally ignored (no-op), as a success URL
      // is not expected to be handled here.
      const bearerTokenFoundInUrl = onLoginUriChanged(
        handleLoginFailure,
        () => null,
        "cie",
        flow
      )(event);

      return !bearerTokenFoundInUrl;
    },
    [
      handleLoginFailure,
      onAuthenticationUrlReceived,
      shouldBlockUrlNavigationWhileCheckingLollipop,
      flow
    ]
  );

  const handleError = useCallback(
    (event: WebViewErrorEvent | WebViewHttpErrorEvent): void => {
      trackLoginError("cie", event);
      const { nativeEvent } = event;
      const { url } = nativeEvent;

      if ("statusCode" in nativeEvent) {
        const { statusCode } = nativeEvent;
        handleFailure(`HTTP error ${statusCode} on ${url}`, {
          type: "WEBVIEW_HTTP_ERROR",
          payload: { statusCode, url }
        });
        return;
      }

      const { code, description } = nativeEvent;
      handleFailure(`WebView error ${code} (${description}) on ${url}`, {
        type: "WEBVIEW_ERROR",
        payload: { code, description, url }
      });
    },
    [handleFailure]
  );

  const handleRetry = useCallback(() => {
    setWebViewState({ status: "authenticating" });
    void generateLoginSource();
  }, [generateLoginSource]);

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const debugInfo = useMemo(() => {
    if (webViewState.status === "failure") {
      return getLoginFailureDebugInfo(webViewState.failure);
    }
    if (loginSourceState.status === "failure") {
      return getLoginFailureDebugInfo({
        type: "ONE_IDENTITY_LOGIN_FAILURE",
        payload: { error: loginSourceState.error }
      });
    }
    return {};
  }, [webViewState, loginSourceState]);
  useDebugInfo(debugInfo);

  if (
    loginSourceState.status === "reserving-public-key" ||
    loginSourceState.status === "following-redirects" ||
    loginSourceState.status === "verifying-assertion-ref"
  ) {
    return (
      <LoadingSpinnerOverlay
        isLoading
        loadingOpacity={1}
        onCancel={handleCancel}
      />
    );
  }

  if (
    webViewState.status === "failure" ||
    loginSourceState.status === "failure"
  ) {
    return (
      <OperationResultScreenContent
        action={{
          label: I18n.t("global.buttons.retry"),
          accessibilityLabel: I18n.t("global.buttons.retry"),
          onPress: handleRetry
        }}
        pictogram="umbrella"
        secondaryAction={{
          label: I18n.t("global.buttons.cancel"),
          accessibilityLabel: I18n.t("global.buttons.cancel"),
          onPress: handleCancel
        }}
        title={I18n.t("authentication.errors.network.title")}
      />
    );
  }

  return (
    /**
     * The LoadingSpinnerOverlay is intentionally kept permanently active while
     * retrieving the authentication URL.
     */
    <LoadingSpinnerOverlay isLoading loadingOpacity={1} onCancel={handleCancel}>
      <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
        <WebView
          androidCameraAccessDisabled={true}
          androidMicrophoneAccessDisabled={true}
          javaScriptEnabled={true}
          onError={handleError}
          onHttpError={handleError}
          onLoadEnd={handleLoadEnd}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          source={loginSourceState.webviewSource}
          testID="cie-authentication-webview"
          userAgent={defaultUserAgent}
        />
      </SafeAreaView>
    </LoadingSpinnerOverlay>
  );
};
