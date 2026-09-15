import { useCallback, useMemo } from "react";

import { apiUrlPrefix } from "../../../../../config";
import {
  HeaderSecondLevelHookProps,
  useHeaderSecondLevel
} from "../../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { useOnboardingAbortAlert } from "../../../../onboarding/hooks/useOnboardingAbortAlert";
import { trackLoginSpidError } from "../../../common/analytics/spidAnalytics";
import {
  CieIdWebViewLogin,
  CieIdWebViewLoginEvent
} from "../../../common/components/CieIdWebViewLogin";
import { IdpSuccessfulAuthentication } from "../../../common/components/IdpSuccessfulAuthentication";
import { useCieIdWebViewLoginNavigation } from "../../../common/hooks/useCieIdWebViewLoginNavigation";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { loginFailure, loginSuccess } from "../../../common/store/actions";
import { loggedInAuthSelector } from "../../../common/store/selectors";
import { AuthLevel } from "../../../common/utils";
import { IdpCIE_ID } from "../../hooks/useNavigateToLoginMethod";

type OneIdentityCieIdLoginScreenProps = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  typeof AUTHENTICATION_ROUTES.CIE_ID_LOGIN
>;

export const OneIdentityCieIdLoginScreen = ({
  navigation,
  route
}: OneIdentityCieIdLoginScreenProps) => {
  const { spidLevel: authLevel, isUat } = route.params;

  const loggedInAuth = useIOSelector(loggedInAuthSelector);

  const { showAlert } = useOnboardingAbortAlert();

  const handleGoBack = useCallback(() => {
    showAlert(() => {
      navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.LANDING
      });
    });
  }, [showAlert, navigation]);

  const headerProps: HeaderSecondLevelHookProps = useMemo(() => {
    if (loggedInAuth) {
      return { title: "", canGoBack: false };
    }
    return {
      title: "",
      goBack: handleGoBack
    };
  }, [handleGoBack, loggedInAuth]);

  useHeaderSecondLevel(headerProps);

  if (loggedInAuth) {
    return <IdpSuccessfulAuthentication />;
  }

  return (
    <OneIdentityCieIdLoginScreenContent authLevel={authLevel} isUat={isUat} />
  );
};

type OneIdentityCieIdLoginScreenContentProps = {
  authLevel: AuthLevel;
  isUat: boolean;
};

const OneIdentityCieIdLoginScreenContent = ({
  isUat,
  authLevel
}: OneIdentityCieIdLoginScreenContentProps) => {
  const dispatch = useIODispatch();

  const {
    navigateToCieIdAuthenticationError,
    navigateToCieIdAuthUrlError,
    navigateToAuthErrorScreen
  } = useCieIdWebViewLoginNavigation({ authLevel, isUat });

  const handleLoginFailure = useCallback(
    (reason: string, code?: string, message?: string) => {
      const errorCodeOrMessage = code ?? message;

      trackLoginSpidError(errorCodeOrMessage, {
        idp: IdpCIE_ID.id,
        flow: "auth",
        "error message": message
      });

      dispatch(
        loginFailure({
          error: new Error(reason),
          idp: "cieid"
        })
      );
      navigateToAuthErrorScreen(errorCodeOrMessage);
    },
    [dispatch, navigateToAuthErrorScreen]
  );

  const handleLoginSuccess = useCallback(
    (token: string) => {
      dispatch(loginSuccess({ token, idp: "cieid" }));
    },
    [dispatch]
  );

  const handleEvent = useCallback(
    (event: CieIdWebViewLoginEvent) => {
      switch (event.type) {
        case "CANCEL":
        case "ONE_IDENTITY_LOGIN_FAILURE":
        case "WEBVIEW_ERROR": {
          navigateToCieIdAuthenticationError();
          break;
        }
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
        case "NOT_ALLOWED_URL": {
          const { url } = event.payload;
          navigateToCieIdAuthUrlError(url);
          break;
        }
        case "WEBVIEW_HTTP_ERROR": {
          const { statusCode, url } = event.payload;
          // Ignore 403 errors for URLs that are not part of the API login URL prefix
          if (!url.includes(apiUrlPrefix) && statusCode === 403) {
            break;
          }
          navigateToCieIdAuthenticationError();
          break;
        }
        default:
          break;
      }
    },
    [
      handleLoginFailure,
      handleLoginSuccess,
      navigateToCieIdAuthUrlError,
      navigateToCieIdAuthenticationError
    ]
  );

  return <CieIdWebViewLogin flow="auth" isUat={isUat} onEvent={handleEvent} />;
};
