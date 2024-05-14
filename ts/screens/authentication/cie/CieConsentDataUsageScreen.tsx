/**
 * A screen to display, by a webview, the consent to send user sensitive data
 * to backend and proceed with the onboarding process
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, NativeEventSubscription } from "react-native";
import {
  WebViewHttpErrorEvent,
  WebViewNavigation
} from "react-native-webview/lib/WebViewTypes";
import { VSpacer } from "@pagopa/io-app-design-system";
import { Route, useRoute } from "@react-navigation/native";
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
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import ROUTES from "../../../navigation/routes";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useOnboardingAbortAlert } from "../../../utils/hooks/useOnboardingAbortAlert";
import CieConsentDataUsageRenderComponent from "./components/CieConsentDataUsageRenderComponent";

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
  const subscription = useRef<NativeEventSubscription | undefined>();
  const navigation = useIONavigation();
  const loginSuccessDispatch = useCallback(
    (token: SessionToken) => dispatch(loginSuccess({ token, idp: "cie" })),
    [dispatch]
  );

  const loginFailureDispatch = useCallback(
    (error: Error) => dispatch(loginFailure({ error, idp: "cie" })),
    [dispatch]
  );

  const navigateToCiePinScreen = useCallback(() => {
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.CIE_PIN_SCREEN
    });
  }, [navigation]);

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

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    subscription.current = BackHandler.addEventListener(
      "hardwareBackPress",
      showAbortAlert
    );
    return () => subscription.current?.remove();
  }, [showAbortAlert]);

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

  useHeaderSecondLevel({
    canGoBack: hasError,
    goBack: showAbortAlert,
    title: ""
  });

  return (
    <CieConsentDataUsageRenderComponent
      isLoginSuccess={isLoginSuccess}
      LoaderComponent={LoaderComponent}
      hasError={hasError}
      errorCode={errorCode}
      cieConsentUri={cieConsentUri}
      originSchemasWhiteList={originSchemasWhiteList}
      handleShouldStartLoading={handleShouldStartLoading}
      handleWebViewError={handleWebViewError}
      handleHttpError={handleHttpError}
      onRetry={navigateToCiePinScreen}
      onCancel={navigateToLandingScreen}
    />
  );
};

export default CieConsentDataUsageScreen;
