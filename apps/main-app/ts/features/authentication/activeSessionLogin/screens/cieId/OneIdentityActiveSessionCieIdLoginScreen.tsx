import { useCallback } from "react";

import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { trackLoginFailure } from "../../../common/analytics";
import { trackLoginSpidError } from "../../../common/analytics/spidAnalytics";
import { CieIdWebViewLogin } from "../../../common/components/CieIdWebViewLogin";
import { useCieIdWebViewLoginNavigation } from "../../../common/hooks/useCieIdWebViewLoginNavigation";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import {
  AUTH_LEVELS,
  isValidCallbackUrl,
  LOGIN_TYPES
} from "../../../common/utils";
import { AUTH_ERRORS } from "../../../common/utils/authError";
import {
  getAuthErrorKey,
  getLoginFailureReason,
  LoginFailure
} from "../../../common/utils/loginFailure";
import { cieEnvSelector } from "../../../login/cie/store/selectors";
import { IdpCIE_ID } from "../../../login/hooks/useNavigateToLoginMethod";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess,
  setFinishedActiveSessionLoginFlow
} from "../../store/actions";
import { cieIDSelectedSecurityLevelActiveSessionLoginSelector } from "../../store/selectors";
import useActiveSessionLoginNavigation from "../../utils/useActiveSessionLoginNavigation";

type OneIdentityActiveSessionCieIdLoginScreenProps =
  IOStackNavigationRouteProps<
    AuthenticationParamsList,
    typeof AUTHENTICATION_ROUTES.CIE_ID_ACTIVE_SESSION_LOGIN
  >;

export const OneIdentityActiveSessionCieIdLoginScreen = ({
  navigation
}: OneIdentityActiveSessionCieIdLoginScreenProps) => {
  const cieEnv = useIOSelector(cieEnvSelector);
  // cieIDSelectedSecurityLevel is always set before this screen is reached
  // (navigateToCieIdLoginScreen dispatches it synchronously before navigating);
  // the fallback only satisfies the type, since the reducer marks it optional.
  // L2 matches navigateToCieIdLoginScreen's own default for the same value
  const authLevel =
    useIOSelector(cieIDSelectedSecurityLevelActiveSessionLoginSelector) ??
    AUTH_LEVELS.L2;

  const dispatch = useIODispatch();

  const { forceLogoutAndNavigateToLanding } = useActiveSessionLoginNavigation();

  const {
    navigateToCieIdAuthenticationError,
    navigateToCieIdAuthUrlError,
    navigateToAuthErrorScreen
  } = useCieIdWebViewLoginNavigation({ authLevel });

  const handleLoginFailure = useCallback(
    (failure: LoginFailure) => {
      const authErrorKey = getAuthErrorKey(failure);
      const { errorMessage } =
        failure.kind === "backend" ? failure.details : {};
      const isDifferentFiscalCode =
        failure.kind === "backend" &&
        failure.details.errorCode === AUTH_ERRORS.ERROR_1004;

      if (!isDifferentFiscalCode) {
        dispatch(activeSessionLoginFailure());
      }

      trackLoginFailure({
        reason: getLoginFailureReason(failure),
        idp: "cieid",
        flow: LOGIN_TYPES.REAUTH
      });
      trackLoginSpidError(authErrorKey, {
        idp: IdpCIE_ID.id,
        flow: LOGIN_TYPES.REAUTH,
        "error message": errorMessage
      });
      navigateToAuthErrorScreen(failure);
    },
    [dispatch, navigateToAuthErrorScreen]
  );

  const handleLoginSuccess = useCallback(
    (token: string) => {
      dispatch(activeSessionLoginSuccess(token));
    },
    [dispatch]
  );

  const handleFailure = useCallback(
    (failure: LoginFailure) => {
      switch (failure.kind) {
        case "backend":
        case "cieIdApp":
        case "idpAppNotOpened":
          handleLoginFailure(failure);
          return;
        case "cieIdUrlNotAllowed":
          navigateToCieIdAuthUrlError(failure.details.url);
          return;
        case "webViewHttp": {
          const { statusCode, url } = failure.details;
          if (isValidCallbackUrl(url)) {
            // The callback URL failed to load: force a logout.
            forceLogoutAndNavigateToLanding();
          } else if (statusCode !== 403) {
            navigateToCieIdAuthenticationError(failure);
          }
          return;
        }
        default:
          navigateToCieIdAuthenticationError(failure);
      }
    },
    [
      forceLogoutAndNavigateToLanding,
      handleLoginFailure,
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
    <CieIdWebViewLogin
      cieEnv={cieEnv}
      flow={LOGIN_TYPES.REAUTH}
      onFailure={handleFailure}
      onSuccess={handleLoginSuccess}
    />
  );
};
