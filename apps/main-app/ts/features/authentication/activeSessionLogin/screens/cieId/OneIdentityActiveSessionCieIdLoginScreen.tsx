import { useCallback } from "react";

import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../../store/hooks";
import { trackLoginFailure } from "../../../common/analytics";
import { trackLoginSpidError } from "../../../common/analytics/spidAnalytics";
import { AUTH_ERRORS } from "../../../common/components/AuthErrorComponent";
import {
  CieIdWebViewLogin,
  CieIdWebViewLoginEvent
} from "../../../common/components/CieIdWebViewLogin";
import { useCieIdWebViewLoginNavigation } from "../../../common/hooks/useCieIdWebViewLoginNavigation";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { isValidCallbackUrl } from "../../../common/utils";
import { IdpCIE_ID } from "../../../login/hooks/useNavigateToLoginMethod";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess,
  setFinishedActiveSessionLoginFlow
} from "../../store/actions";
import useActiveSessionLoginNavigation from "../../utils/useActiveSessionLoginNavigation";

type OneIdentityActiveSessionCieIdLoginScreenProps =
  IOStackNavigationRouteProps<
    AuthenticationParamsList,
    typeof AUTHENTICATION_ROUTES.CIE_ID_ACTIVE_SESSION_LOGIN
  >;

export const OneIdentityActiveSessionCieIdLoginScreen = ({
  navigation,
  route
}: OneIdentityActiveSessionCieIdLoginScreenProps) => {
  const { spidLevel: authLevel, isUat } = route.params;

  const dispatch = useIODispatch();

  const { forceLogoutAndNavigateToLanding } = useActiveSessionLoginNavigation();

  const {
    navigateToCieIdAuthenticationError,
    navigateToCieIdAuthUrlError,
    navigateToAuthErrorScreen
  } = useCieIdWebViewLoginNavigation({ authLevel, isUat });

  const handleLoginFailure = useCallback(
    (reason: string, code?: string, message?: string) => {
      const errorCodeOrMessage = code ?? message;

      if (code !== AUTH_ERRORS.ERROR_1004) {
        dispatch(activeSessionLoginFailure());
      }

      trackLoginFailure({ reason, idp: "cieid", flow: "reauth" });
      trackLoginSpidError(errorCodeOrMessage, {
        idp: IdpCIE_ID.id,
        flow: "reauth",
        "error message": message
      });
      navigateToAuthErrorScreen(errorCodeOrMessage);
    },
    [dispatch, navigateToAuthErrorScreen]
  );

  const handleLoginSuccess = useCallback(
    (token: string) => {
      dispatch(activeSessionLoginSuccess(token));
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
          const { url, statusCode } = event.payload;

          if (isValidCallbackUrl(url)) {
            // The callback URL failed to load: force a logout.
            forceLogoutAndNavigateToLanding();
            break;
          }
          if (statusCode !== 403) {
            navigateToAuthErrorScreen();
            break;
          }
          break;
        }
        default:
          break;
      }
    },
    [
      forceLogoutAndNavigateToLanding,
      handleLoginFailure,
      handleLoginSuccess,
      navigateToAuthErrorScreen,
      navigateToCieIdAuthUrlError,
      navigateToCieIdAuthenticationError
    ]
  );

  const handleGoBack = useCallback(() => {
    dispatch(setFinishedActiveSessionLoginFlow());
    navigation.popToTop();
  }, [dispatch, navigation]);

  useHeaderSecondLevel({
    title: "",
    goBack: handleGoBack
  });

  return (
    <CieIdWebViewLogin flow="reauth" isUat={isUat} onEvent={handleEvent} />
  );
};
