/**
 * A screen to display, by a webview, the consent to send user sensitive data
 * to backend and proceed with the onboarding process
 */
import { Route, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import {
  WebViewHttpErrorEvent,
  WebViewNavigation
} from "react-native-webview/lib/WebViewTypes";
import {
  trackLoginCieConsentDataUsageScreen,
  trackLoginCieDataSharingError
} from "../../../common/analytics/cieAnalytics";
import { originSchemasWhiteList } from "../../../common/utils/originSchemasWhiteList";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useOnboardingAbortAlert } from "../../../../onboarding/hooks/useOnboardingAbortAlert";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { useIODispatch } from "../../../../../store/hooks";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { loginFailure, loginSuccess } from "../../../common/store/actions";
import { onLoginUriChanged } from "../../../common/utils/login";
import { LoaderComponent } from "../../../activeSessionLogin/shared/components/LoaderComponent";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";

export type CieConsentDataUsageScreenNavigationParams = {
  cieConsentUri: string;
  errorCodeDebugMode?: string;
};

const CieConsentDataUsageScreen = () => {
  const route =
    useRoute<
      Route<
        typeof AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE,
        CieConsentDataUsageScreenNavigationParams
      >
    >();
  const { cieConsentUri } = route.params;
  const dispatch = useIODispatch();
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState<boolean | undefined>();
  const [errorCodeOrMessage, setErrorCodeOrMessage] = useState<
    string | undefined
  >();
  const { showAlert } = useOnboardingAbortAlert();
  const navigation = useIONavigation();
  const loginSuccessDispatch = useCallback(
    (token: string) => dispatch(loginSuccess({ token, idp: "cie" })),
    [dispatch]
  );

  const loginFailureDispatch = useCallback(
    (error: Error) => dispatch(loginFailure({ error, idp: "cie" })),
    [dispatch]
  );

  const navigateToLandingScreen = useCallback(() => {
    navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.LANDING
    });
  }, [navigation]);

  const showAbortAlert = useCallback((): boolean => {
    // if the screen is in error state, skip the confirmation alert to go back at the landing screen
    if (hasError) {
      navigateToLandingScreen();
      return true;
    }
    showAlert(navigateToLandingScreen);
    return true;
  }, [hasError, navigateToLandingScreen, showAlert]);

  useHeaderSecondLevel({ title: "", goBack: showAbortAlert });

  const handleWebViewError = useCallback(() => setHasError(true), []);

  const handleHttpError = useCallback(
    (event: WebViewHttpErrorEvent) => {
      loginFailureDispatch(
        new Error(
          `HTTP error ${event.nativeEvent.description} with Authorization uri`
        )
      );
    },
    [loginFailureDispatch]
  );

  const handleLoginSuccess = useCallback(
    (token: string) => {
      setIsLoginSuccess(true);
      setHasError(false);
      loginSuccessDispatch(token);
    },
    [loginSuccessDispatch]
  );

  const handleLoginFailure = useCallback(
    (code?: string, message?: string) => {
      setHasError(true);
      setErrorCodeOrMessage(code);
      loginFailureDispatch(
        new Error(`login CIE failure with code ${code || message || "n/a"}`)
      );
    },
    [loginFailureDispatch]
  );

  const handleShouldStartLoading = useCallback(
    (event: WebViewNavigation): boolean => {
      const isLoginUrlWithToken = onLoginUriChanged(
        handleLoginFailure,
        handleLoginSuccess,
        "cie"
      )(event);
      // URL can be loaded if it's not the login URL containing the session token - this avoids
      // making a (useless) GET request with the session in the URL
      return !isLoginUrlWithToken;
    },
    [handleLoginFailure, handleLoginSuccess]
  );

  // fix of https://github.com/pagopa/io-app/pull/5750/files#diff-89c251a9a9539e3470c6001c13917f0881272bfa692f61bdc4a6f191b0435fa3
  useOnFirstRender(() => {
    void trackLoginCieConsentDataUsageScreen();
  });

  useEffect(() => {
    if (hasError && errorCodeOrMessage === "22") {
      trackLoginCieDataSharingError();
    }
  }, [errorCodeOrMessage, hasError]);

  useEffect(() => {
    if (hasError) {
      navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
        params: {
          errorCodeOrMessage,
          authMethod: "CIE",
          authLevel: "L2"
        }
      });
    }
  }, [errorCodeOrMessage, hasError, navigation]);

  if (isLoginSuccess) {
    return <LoaderComponent />;
  }
  if (!hasError) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <WebView
          testID="webview-cie-test"
          androidCameraAccessDisabled={true}
          androidMicrophoneAccessDisabled={true}
          textZoom={100}
          originWhitelist={originSchemasWhiteList}
          source={{ uri: decodeURIComponent(cieConsentUri) }}
          javaScriptEnabled={true}
          onShouldStartLoadWithRequest={handleShouldStartLoading}
          renderLoading={() => <LoaderComponent />}
          onError={handleWebViewError}
          onHttpError={handleHttpError}
        />
      </SafeAreaView>
    );
  }
  return null;
};

export default CieConsentDataUsageScreen;
