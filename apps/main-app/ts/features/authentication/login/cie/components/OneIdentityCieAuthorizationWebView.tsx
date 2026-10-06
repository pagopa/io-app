import { IdpData } from "@io-app/api-types/generated/definitions/content/IdpData";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";

import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { useOnboardingAbortAlert } from "../../../../onboarding/hooks/useOnboardingAbortAlert";
import { OneIdentityActiveSessionLoginCieAuthorizationWebView } from "../../../activeSessionLogin/screens/cie/OneIdentityActiveSessionLoginCieAuthorizationWebView";
import { isActiveSessionLoginSelector } from "../../../activeSessionLogin/store/selectors";
import {
  trackLoginCieConsentDataUsageScreen,
  trackLoginCieDataSharingError
} from "../../../common/analytics/cieAnalytics";
import {
  CieWebViewLogin,
  CieWebViewLoginEvent
} from "../../../common/components/CieWebViewLogin";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { loginFailure, loginSuccess } from "../../../common/store/actions";
import { AUTH_LEVELS } from "../../../common/utils";
import { AUTH_ERRORS } from "../../../common/utils/authError";

type OneIdentityCieAuthorizationWebViewProps = {
  authorizationUrl: string;
};

/**
 * Component responsible for handling the One Identity CIE authorization web
 * view. It checks for an active session login and renders the appropriate
 * content component.
 */
export const OneIdentityCieAuthorizationWebView = ({
  authorizationUrl
}: OneIdentityCieAuthorizationWebViewProps) => {
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);

  if (isActiveSessionLogin) {
    return (
      <OneIdentityActiveSessionLoginCieAuthorizationWebView
        authorizationUrl={authorizationUrl}
      />
    );
  }

  return (
    <OneIdentityCieAuthorizationWebViewContent
      authorizationUrl={authorizationUrl}
    />
  );
};

type OneIdentityCieAuthorizationWebViewContentProps = {
  authorizationUrl: string;
};

const OneIdentityCieAuthorizationWebViewContent = ({
  authorizationUrl
}: OneIdentityCieAuthorizationWebViewContentProps) => {
  const dispatch = useIODispatch();
  const navigation =
    useNavigation<IOStackNavigationProp<AuthenticationParamsList>>();

  const { showAlert } = useOnboardingAbortAlert();

  const handleGoBack = useCallback(
    () =>
      showAlert(() => {
        navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
          screen: AUTHENTICATION_ROUTES.LANDING
        });
      }),
    [showAlert, navigation]
  );

  useHeaderSecondLevel({ title: "", goBack: handleGoBack });

  useOnFirstRender(() => {
    trackLoginCieConsentDataUsageScreen();
  });

  const navigateToAuthErrorScreen = useCallback(
    (errorCodeOrMessage?: string) =>
      navigation.replace(AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN, {
        errorCodeOrMessage,
        authMethod: "CIE",
        authLevel: AUTH_LEVELS.L3
      }),
    [navigation]
  );

  const handleLoginFailure = useCallback(
    (reason: string, code?: string, message?: string) => {
      if (code === AUTH_ERRORS.ERROR_22) {
        trackLoginCieDataSharingError();
      }

      dispatch(
        loginFailure({
          error: new Error(reason),
          idp: "cie" as keyof IdpData
        })
      );
      const errorCodeOrMessage = code ?? message;
      navigateToAuthErrorScreen(errorCodeOrMessage);
    },
    [dispatch, navigateToAuthErrorScreen]
  );

  const handleLoginSuccess = useCallback(
    (token: string) => {
      dispatch(loginSuccess({ token, idp: "cie" as keyof IdpData }));
    },
    [dispatch]
  );

  const handleEvent = useCallback(
    (event: CieWebViewLoginEvent) => {
      switch (event.type) {
        case "LOGIN_FAILURE": {
          const { code, message, reason } = event.payload;
          handleLoginFailure(reason, code, message);
          break;
        }
        case "LOGIN_SUCCESS": {
          const { token } = event.payload;
          handleLoginSuccess(token);
          break;
        }
        case "WEBVIEW_ERROR": {
          const { url } = event.payload;
          handleLoginFailure(`WebView error for URL ${url}`);
          break;
        }
        case "WEBVIEW_HTTP_ERROR": {
          const { statusCode, url } = event.payload;
          handleLoginFailure(`WebView HTTP error ${statusCode} for URL ${url}`);
          break;
        }
        default:
          break;
      }
    },
    [handleLoginFailure, handleLoginSuccess]
  );

  return <CieWebViewLogin onEvent={handleEvent} url={authorizationUrl} />;
};
