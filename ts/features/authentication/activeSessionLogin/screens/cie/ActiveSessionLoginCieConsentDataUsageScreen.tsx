/**
 * A screen to display, by a webview, the consent to send user sensitive data
 * to backend and proceed with the onboarding process
 */
import { Route, useRoute } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewNavigation
} from "react-native-webview/lib/WebViewTypes";
import { originSchemasWhiteList } from "../../../common/utils/originSchemasWhiteList";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { useIODispatch } from "../../../../../store/hooks";
import { SessionToken } from "../../../../../types/SessionToken";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { onLoginUriChanged } from "../../../common/utils/login";
import { AUTH_ERRORS } from "../../../common/components/AuthErrorComponent";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess,
  setFinishedActiveSessionLoginFlow
} from "../../store/actions";
import { CieConsentDataUsageScreenNavigationParams } from "../../../login/cie/screens/CieConsentDataUsageScreen";
import { LoaderComponent } from "../../shared/components/LoaderComponent";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import ROUTES from "../../../../../navigation/routes";
import useActiveSessionLoginNavigation from "../../utils/useActiveSessionLoginNavigation";
import { ACS_PATH } from "../../shared/utils";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import {
  trackLoginCieConsentDataUsageScreen,
  trackLoginCieDataSharingError
} from "../../../common/analytics/cieAnalytics";
import { trackLoginFailure } from "../../../common/analytics";

const ActiveSessionLoginCieConsentDataUsageScreen = () => {
  const route =
    useRoute<
      Route<
        typeof AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE_ACTIVE_SESSION_LOGIN,
        CieConsentDataUsageScreenNavigationParams
      >
    >();
  const { cieConsentUri } = route.params;
  const acsUrl = `${cieConsentUri}${ACS_PATH}`;
  const dispatch = useIODispatch();
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState<boolean | undefined>();
  const navigation = useIONavigation();
  const { forceLogoutAndNavigateToLanding } = useActiveSessionLoginNavigation();

  //   const loginSuccessDispatch = useCallback(
  //     (token: SessionToken) => dispatch(loginSuccess({ token, idp: "cie" })),
  //     [dispatch]
  //   );

  useOnFirstRender(() => {
    void trackLoginCieConsentDataUsageScreen("reauth");
  });

  const navigateToErrorScreen = useCallback(
    (errorCodeOrMessageProp?: string) => {
      navigation.replace(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
        params: {
          errorCodeOrMessage: errorCodeOrMessageProp,
          authMethod: "CIE",
          authLevel: "L2"
        }
      });
    },
    [navigation]
  );

  const navigateBack = () => {
    dispatch(setFinishedActiveSessionLoginFlow());
    navigation.navigate(ROUTES.MAIN, {
      screen: MESSAGES_ROUTES.MESSAGES_HOME
    });
  };

  useHeaderSecondLevel({
    title: "",
    goBack: navigateBack
  });

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
      if (code !== AUTH_ERRORS.ERROR_1004) {
        dispatch(activeSessionLoginFailure());
      }
      if (code === "22") {
        trackLoginCieDataSharingError("reauth");
      }
      setHasError(true);
      navigateToErrorScreen(code || message);
      trackLoginFailure({
        reason: new Error(
          `login CIE failure with code ${code || message || "n/a"}`
        ),
        idp: "cie",
        flow: "reauth"
      });
    },
    [dispatch, navigateToErrorScreen]
  );

  const handleLoadingError = useCallback(
    (error: WebViewErrorEvent | WebViewHttpErrorEvent): void => {
      // TODO: error tracking  https://pagopa.atlassian.net/browse/IOPID-2079
      const webViewHttpError = error as WebViewHttpErrorEvent;
      if (webViewHttpError.nativeEvent.statusCode) {
        const { statusCode, url } = webViewHttpError.nativeEvent;
        if (url.includes(acsUrl)) {
          forceLogoutAndNavigateToLanding();
        } else if (statusCode !== 403) {
          handleLoginFailure();
        }
      } else {
        handleLoginFailure();
      }
    },
    [acsUrl, forceLogoutAndNavigateToLanding, handleLoginFailure]
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
          onError={handleLoadingError}
          onHttpError={handleLoadingError}
        />
      </SafeAreaView>
    );
  }
  return null;
};

export default ActiveSessionLoginCieConsentDataUsageScreen;
