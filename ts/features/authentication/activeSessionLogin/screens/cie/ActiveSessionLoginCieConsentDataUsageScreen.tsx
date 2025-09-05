/**
 * A screen to display, by a webview, the consent to send user sensitive data
 * to backend and proceed with the onboarding process
 */
import { Route, useRoute } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import {
  WebViewHttpErrorEvent,
  WebViewNavigation
} from "react-native-webview/lib/WebViewTypes";
import { originSchemasWhiteList } from "../../../common/utils/originSchemasWhiteList";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useOnboardingAbortAlert } from "../../../../onboarding/hooks/useOnboardingAbortAlert";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { useIODispatch } from "../../../../../store/hooks";
import { SessionToken } from "../../../../../types/SessionToken";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { onLoginUriChanged } from "../../../common/utils/login";
import { AUTH_ERRORS } from "../../../common/components/AuthErrorComponent";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess
} from "../../store/actions";
import {
  CieConsentDataUsageScreenNavigationParams,
  LoaderComponent
} from "../../../login/cie/screens/CieConsentDataUsageScreen";

// The MP events related to this page have been commented on,
// pending their correct integration into the flow.
// Task: https://pagopa.atlassian.net/browse/IOPID-3343

const ActiveSessionLoginCieConsentDataUsageScreen = () => {
  const route =
    useRoute<
      Route<
        typeof AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE_ACTIVE_SESSION_LOGIN,
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

  //   const loginSuccessDispatch = useCallback(
  //     (token: SessionToken) => dispatch(loginSuccess({ token, idp: "cie" })),
  //     [dispatch]
  //   );

  // const loginFailureDispatch = useCallback(
  //   (error: Error) => dispatch(loginFailure({ error, idp: "cie" })),
  //   [dispatch]
  // );

  const navigateToLandingScreen = useCallback(() => {
    navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.LANDING
    });
  }, [navigation]);

  const navigateToErrorScreen = useCallback(() => {
    navigation.replace(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      params: {
        errorCodeOrMessage,
        authMethod: "CIE",
        authLevel: "L2"
      }
    });
  }, [errorCodeOrMessage, navigation]);

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

  const handleWebViewError = () => {
    setHasError(true);
    navigateToErrorScreen();
  };

  const handleHttpError = (_: WebViewHttpErrorEvent) => {
    // loginFailureDispatch(
    //   new Error(
    //     `HTTP error ${event.nativeEvent.description} with Authorization uri`
    //   )
    // );
    dispatch(activeSessionLoginFailure());
  };

  const handleLoginSuccess = useCallback(
    (token: SessionToken) => {
      setIsLoginSuccess(true);
      setHasError(false);
      //   loginSuccessDispatch(token);
      dispatch(activeSessionLoginSuccess(token));
    },
    [dispatch]
  );

  const handleLoginFailure = useCallback(
    (code?: string, message?: string) => {
      if (code !== AUTH_ERRORS.NOT_SAME_CF) {
        dispatch(activeSessionLoginFailure());
      }
      setHasError(true);
      setErrorCodeOrMessage(code || message);
      navigateToErrorScreen();
      //   loginFailureDispatch(
      //     new Error(`login CIE failure with code ${code || message || "n/a"}`)
      //   );
    },
    [dispatch, navigateToErrorScreen]
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

  //   useEffect(() => {
  //     if (hasError && errorCodeOrMessage === "22") {
  //       trackLoginCieDataSharingError();
  //     }
  //   }, [errorCodeOrMessage, hasError]);

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

export default ActiveSessionLoginCieConsentDataUsageScreen;
