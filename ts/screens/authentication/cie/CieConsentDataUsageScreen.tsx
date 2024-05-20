/**
 * A screen to display, by a webview, the consent to send user sensitive data
 * to backend and proceed with the onboarding process
 */
import React, { useCallback, useEffect, useState } from "react";
import {
  WebViewHttpErrorEvent,
  WebViewNavigation
} from "react-native-webview/lib/WebViewTypes";
import { VSpacer } from "@pagopa/io-app-design-system";
import { Route, useRoute } from "@react-navigation/native";
import WebView from "react-native-webview";
import { useIODispatch } from "../../../store/hooks";
import {
  loginFailure,
  loginSuccess
} from "../../../store/actions/authentication";
import { SessionToken } from "../../../types/SessionToken";
import { onLoginUriChanged } from "../../../utils/login";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";
import { trackLoginCieDataSharingError } from "../analytics/cieAnalytics";
import { originSchemasWhiteList } from "../originSchemasWhiteList";
import ROUTES from "../../../navigation/routes";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useOnboardingAbortAlert } from "../../../utils/hooks/useOnboardingAbortAlert";
import { useHardwareBackButton } from "../../../hooks/useHardwareBackButton";

export type CieConsentDataUsageScreenNavigationParams = {
  cieConsentUri: string;
  errorCodeDebugMode?: string;
};

const LoaderComponent = () => (
  <LoadingSpinnerOverlay loadingOpacity={1.0} isLoading={true}>
    <VSpacer size={16} />
  </LoadingSpinnerOverlay>
);

const CieConsentDataUsageScreen = () => {
  const route =
    useRoute<
      Route<"CIE_CONSENT_DATA_USAGE", CieConsentDataUsageScreenNavigationParams>
    >();
  const { cieConsentUri } = route.params;
  const dispatch = useIODispatch();
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState<boolean | undefined>();
  const [errorCode, setErrorCode] = useState<string | undefined>();
  const { showAlert } = useOnboardingAbortAlert();
  const navigation = useIONavigation();
  const loginSuccessDispatch = useCallback(
    (token: SessionToken) => dispatch(loginSuccess({ token, idp: "cie" })),
    [dispatch]
  );

  const loginFailureDispatch = useCallback(
    (error: Error) => dispatch(loginFailure({ error, idp: "cie" })),
    [dispatch]
  );

  const navigateToLandingScreen = useCallback(() => {
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_LANDING
    });
  }, [navigation]);

  const showAbortAlert = useCallback((): boolean => {
    // if the screen is in error state, skip the confirmation alert to go back at the landing screen
    if (hasError) {
      navigateToLandingScreen();
      return true;
    }
    showAlert();
    return true;
  }, [hasError, navigateToLandingScreen, showAlert]);

  useHardwareBackButton(() => {
    showAbortAlert();
    return true;
  });

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
    (token: SessionToken) => {
      setIsLoginSuccess(true);
      setHasError(false);
      loginSuccessDispatch(token);
    },
    [loginSuccessDispatch]
  );

  const handleLoginFailure = useCallback(
    (errorCode?: string) => {
      setHasError(true);
      setErrorCode(errorCode);
      loginFailureDispatch(
        new Error(`login CIE failure with code ${errorCode || "n/a"}`)
      );
    },
    [loginFailureDispatch]
  );

  const handleShouldStartLoading = useCallback(
    (event: WebViewNavigation): boolean => {
      const isLoginUrlWithToken = onLoginUriChanged(
        handleLoginFailure,
        handleLoginSuccess
      )(event);
      // URL can be loaded if it's not the login URL containing the session token - this avoids
      // making a (useless) GET request with the session in the URL
      return !isLoginUrlWithToken;
    },
    [handleLoginFailure, handleLoginSuccess]
  );

  useEffect(() => {
    if (hasError && errorCode === "22") {
      trackLoginCieDataSharingError();
    }
  }, [errorCode, hasError]);

  useEffect(() => {
    if (hasError) {
      if (errorCode === "1002") {
        navigation.navigate(ROUTES.AUTHENTICATION, {
          screen: ROUTES.UNLOCK_ACCESS_SCREEN,
          params: { authLevel: "L2" }
        });
        return;
      }
      navigation.navigate(ROUTES.AUTHENTICATION, {
        screen: ROUTES.AUTH_ERROR_SCREEN,
        params: { errorCode }
      });
    }
  }, [errorCode, hasError, navigation]);

  if (isLoginSuccess) {
    return <LoaderComponent />;
  }
  if (!hasError) {
    return (
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
    );
  }
  return null;
};

export default CieConsentDataUsageScreen;
