import I18n from "i18next";
import { useCallback, useState } from "react";
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
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIOSelector, useIOStore } from "../../../../../store/hooks";
import { trackSpidLoginError } from "../../../../../utils/analytics";
import { useOneIdentityLoginSource } from "../../../../lollipop/hooks/useOneIdentityLoginSource";
import { cieLoginFlowSelector } from "../../../activeSessionLogin/store/selectors";
import { AUTH_LEVELS, onLoginUriChanged } from "../../../common/utils";
import { defaultUserAgent } from "../../../common/utils/cie";
import { isCieLoginUatEnabledSelector } from "../store/selectors";
import { getCieIdpId } from "../utils";

/**
 * Checks if a given URL is an authentication URL.
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
 * @param title The page title to check.
 * @returns `true` if the page title corresponds to an error page, `false` otherwise.
 */
const isErrorPage = (title?: string): boolean => {
  if (!title) {
    return false;
  }
  const ERROR_PAGE_TITLES = ["pagina web non disponibile", "errore"];
  return ERROR_PAGE_TITLES.includes(title.toLowerCase());
};

export type OneIdentityCieAuthenticationWebViewProps = {
  onAuthenticationUrlReceived: (url: string) => void;
};

type WebViewState =
  | { reason: string; status: "failure" }
  | { status: "authenticating" };

export const OneIdentityCieAuthenticationWebView = ({
  onAuthenticationUrlReceived
}: OneIdentityCieAuthenticationWebViewProps) => {
  const store = useIOStore();
  const navigation = useIONavigation();

  const useUat = useIOSelector(isCieLoginUatEnabledSelector);

  const [webViewState, setWebViewState] = useState<WebViewState>({
    status: "authenticating"
  });

  const handleFailure = useCallback((reason: string) => {
    setWebViewState({ status: "failure", reason });
    trackSpidLoginError("cie", new Error(reason));
  }, []);

  const {
    loginSourceState,
    shouldBlockUrlNavigationWhileCheckingLollipop,
    generateLoginSource
  } = useOneIdentityLoginSource({
    idpId: getCieIdpId(useUat),
    onFailure: handleFailure,
    minAuthLevel: AUTH_LEVELS.L3
  });

  const handleLoadEnd = (event: WebViewErrorEvent | WebViewNavigationEvent) => {
    const title = event.nativeEvent.title;

    if (isErrorPage(title)) {
      handleFailure(title);
      return;
    }
  };

  const handleLoginFailure = useCallback(
    (code?: string, message?: string) => {
      const reason = code
        ? `login failed with code ${code}`
        : message
          ? `login failed with message ${message}`
          : "login failed with no error code or message available";

      handleFailure(reason);
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

      const loginFlow = cieLoginFlowSelector(store.getState());
      // At this stage of the login flow, we only monitor the URL for potential errors.
      // The success callback is intentionally ignored (no-op), as a success URL
      // is not expected to be handled here.
      const isLoginUrlWithToken = onLoginUriChanged(
        handleLoginFailure,
        () => null,
        "cie",
        loginFlow
      )(event);

      return !isLoginUrlWithToken;
    },
    [
      handleLoginFailure,
      onAuthenticationUrlReceived,
      shouldBlockUrlNavigationWhileCheckingLollipop,
      store
    ]
  );

  const handleError = useCallback(
    (event: WebViewErrorEvent | WebViewHttpErrorEvent): void => {
      trackSpidLoginError("cie", event);
      const nativeEvent = event.nativeEvent;
      const reason =
        "statusCode" in nativeEvent
          ? `HTTP error ${nativeEvent.statusCode} on ${nativeEvent.url}`
          : `WebView error on ${nativeEvent.url}`;

      handleFailure(reason);
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

  if (
    loginSourceState.status === "reserving-public-key" ||
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
     * The LoadingSpinnerOverlay is intentionally kept permanently active
     * while retrieving the authentication URL.
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
