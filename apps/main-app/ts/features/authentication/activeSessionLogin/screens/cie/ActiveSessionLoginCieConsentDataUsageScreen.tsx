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

import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../../navigation/routes";
import { useIODispatch } from "../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import { trackLoginFailure } from "../../../common/analytics";
import {
  trackLoginCieConsentDataUsageScreen,
  trackLoginCieDataSharingError
} from "../../../common/analytics/cieAnalytics";
import { AUTH_ERRORS } from "../../../common/components/AuthErrorComponent";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { onLoginUriChanged } from "../../../common/utils/login";
import { originSchemasWhiteList } from "../../../common/utils/originSchemasWhiteList";
import { LoaderComponent } from "../../shared/components/LoaderComponent";
import { ACS_PATH } from "../../shared/utils";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess,
  setFinishedActiveSessionLoginFlow
} from "../../store/actions";
import useActiveSessionLoginNavigation from "../../utils/useActiveSessionLoginNavigation";
import { ReauthLoginType } from "../analytics";

export type ActiveSessionLoginCieConsentDataUsageScreenNavigationParams = {
  cieConsentUri: string;
  errorCodeDebugMode?: string;
  loginType: ReauthLoginType;
};

const ActiveSessionLoginCieConsentDataUsageScreen = () => {
  const route =
    useRoute<
      Route<
        typeof AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE_ACTIVE_SESSION_LOGIN,
        ActiveSessionLoginCieConsentDataUsageScreenNavigationParams
      >
    >();
  const { cieConsentUri, loginType } = route.params;
  const acsUrl = `${cieConsentUri}${ACS_PATH}`;
  const dispatch = useIODispatch();
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState<boolean | undefined>();
  const navigation = useIONavigation();
  const { forceLogoutAndNavigateToLanding } = useActiveSessionLoginNavigation();

  useOnFirstRender(() => {
    void trackLoginCieConsentDataUsageScreen(loginType);
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
    (token: string) => {
      setIsLoginSuccess(true);
      setHasError(false);
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
        trackLoginCieDataSharingError(loginType);
      }
      setHasError(true);
      navigateToErrorScreen(code || message);
      trackLoginFailure({
        reason: `login CIE failure with code ${code || message || "n/a"}`,
        idp: "cie",
        flow: loginType
      });
    },
    [dispatch, navigateToErrorScreen, loginType]
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
        "cie",
        "reauth"
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
          androidCameraAccessDisabled={true}
          androidMicrophoneAccessDisabled={true}
          javaScriptEnabled={true}
          onError={handleLoadingError}
          onHttpError={handleLoadingError}
          onShouldStartLoadWithRequest={handleShouldStartLoading}
          originWhitelist={originSchemasWhiteList}
          renderLoading={() => <LoaderComponent />}
          source={{ uri: decodeURIComponent(cieConsentUri) }}
          testID="webview-cie-test"
          textZoom={100}
        />
      </SafeAreaView>
    );
  }
  return null;
};

export default ActiveSessionLoginCieConsentDataUsageScreen;
