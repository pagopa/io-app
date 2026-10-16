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
import { AUTH_LEVELS, AuthLevel, LOGIN_TYPES } from "../../../common/utils";
import { CANCELLED_LOGIN_DEBUG_INFO } from "../../../common/utils/loginErrorDebugInfo";
import {
  cieIDSelectedSecurityLevelSelector,
  isCieLoginUatEnabledSelector
} from "../../cie/store/selectors";
import { IdpCIE_ID } from "../../hooks/useNavigateToLoginMethod";

type OneIdentityCieIdLoginScreenProps = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  typeof AUTHENTICATION_ROUTES.CIE_ID_LOGIN
>;

export const OneIdentityCieIdLoginScreen = ({
  navigation
}: OneIdentityCieIdLoginScreenProps) => {
  const isUat = useIOSelector(isCieLoginUatEnabledSelector);
  // cieIDSelectedSecurityLevel is always set before this screen is reached
  // (navigateToCieIdLoginScreen dispatches it synchronously before navigating);
  // the fallback only satisfies the type, since the reducer marks it optional.
  // L2 matches navigateToCieIdLoginScreen's own default for the same value
  const authLevel =
    useIOSelector(cieIDSelectedSecurityLevelSelector) ?? AUTH_LEVELS.L2;
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
  } = useCieIdWebViewLoginNavigation({ authLevel });

  const handleLoginFailure = useCallback(
    (reason: string, code?: string, message?: string) => {
      const errorCodeOrMessage = code ?? message;

      trackLoginSpidError(errorCodeOrMessage, {
        idp: IdpCIE_ID.id,
        flow: LOGIN_TYPES.AUTH,
        "error message": message
      });

      dispatch(
        loginFailure({
          error: new Error(reason),
          idp: "cieid"
        })
      );
      navigateToAuthErrorScreen(errorCodeOrMessage, { message: reason });
    },
    [dispatch, navigateToAuthErrorScreen]
  );

  const handleLoginSuccess = useCallback(
    (token: string) => {
      dispatch(loginSuccess({ token, idp: "cieid", isOneIdentityLogin: true }));
    },
    [dispatch]
  );

  const handleEvent = useCallback(
    (event: CieIdWebViewLoginEvent) => {
      switch (event.type) {
        case "CANCEL": {
          navigateToCieIdAuthenticationError(CANCELLED_LOGIN_DEBUG_INFO);
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
        case "ONE_IDENTITY_LOGIN_FAILURE": {
          const { debugInfo, reason } = event.payload;
          navigateToCieIdAuthenticationError(debugInfo ?? { message: reason });
          break;
        }
        case "WEBVIEW_ERROR": {
          navigateToCieIdAuthenticationError(event.payload.debugInfo);
          break;
        }
        case "WEBVIEW_HTTP_ERROR": {
          const { statusCode, url } = event.payload;
          // Ignore 403 errors for URLs that are not part of the API login URL prefix
          if (!url.includes(apiUrlPrefix) && statusCode === 403) {
            break;
          }
          navigateToCieIdAuthenticationError(event.payload.debugInfo);
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

  return <CieIdWebViewLogin isUat={isUat} onEvent={handleEvent} />;
};
