import { useCallback, useMemo } from "react";

import {
  HeaderSecondLevelHookProps,
  useHeaderSecondLevel
} from "../../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { useOnboardingAbortAlert } from "../../../../onboarding/hooks/useOnboardingAbortAlert";
import { trackLoginSpidError } from "../../../common/analytics/spidAnalytics";
import { CieIdWebViewLogin } from "../../../common/components/CieIdWebViewLogin";
import { IdpSuccessfulAuthentication } from "../../../common/components/IdpSuccessfulAuthentication";
import { useCieIdWebViewLoginNavigation } from "../../../common/hooks/useCieIdWebViewLoginNavigation";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { loginFailure, loginSuccess } from "../../../common/store/actions";
import { loggedInAuthSelector } from "../../../common/store/selectors";
import {
  AUTH_LEVELS,
  isForbiddenOutsideIoApi,
  LOGIN_TYPES
} from "../../../common/utils";
import {
  getAuthErrorKey,
  getLoginFailureReason,
  LoginFailure
} from "../../../common/utils/loginFailure";
import {
  cieEnvSelector,
  cieIDSelectedSecurityLevelSelector
} from "../../cie/store/selectors";
import { IdpCIE_ID } from "../../hooks/useNavigateToLoginMethod";

type OneIdentityCieIdLoginScreenProps = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  typeof AUTHENTICATION_ROUTES.CIE_ID_LOGIN
>;

export const OneIdentityCieIdLoginScreen = ({
  navigation
}: OneIdentityCieIdLoginScreenProps) => {
  const loggedInAuth = useIOSelector(loggedInAuthSelector);

  const { showAlert } = useOnboardingAbortAlert();

  const handleGoBack = useCallback(() => {
    showAlert(() => navigation.popTo(AUTHENTICATION_ROUTES.LANDING));
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

  return <OneIdentityCieIdLoginScreenContent />;
};

const OneIdentityCieIdLoginScreenContent = () => {
  const dispatch = useIODispatch();

  const cieEnv = useIOSelector(cieEnvSelector);
  // cieIDSelectedSecurityLevel is always set before this screen is reached
  // (navigateToCieIdLoginScreen dispatches it synchronously before navigating);
  // the fallback only satisfies the type, since the reducer marks it optional.
  // L2 matches navigateToCieIdLoginScreen's own default for the same value
  const authLevel =
    useIOSelector(cieIDSelectedSecurityLevelSelector) ?? AUTH_LEVELS.L2;

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

      trackLoginSpidError(authErrorKey, {
        idp: IdpCIE_ID.id,
        flow: LOGIN_TYPES.AUTH,
        "error message": errorMessage
      });

      dispatch(
        loginFailure({
          error: new Error(getLoginFailureReason(failure)),
          idp: "cieid"
        })
      );
      navigateToAuthErrorScreen(failure);
    },
    [dispatch, navigateToAuthErrorScreen]
  );

  const handleLoginSuccess = useCallback(
    (token: string) => {
      dispatch(loginSuccess({ token, idp: "cieid", isOneIdentityLogin: true }));
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
        case "webViewHttp":
          if (!isForbiddenOutsideIoApi(failure)) {
            navigateToCieIdAuthenticationError(failure);
          }
          return;
        default:
          navigateToCieIdAuthenticationError(failure);
      }
    },
    [
      handleLoginFailure,
      navigateToCieIdAuthUrlError,
      navigateToCieIdAuthenticationError
    ]
  );

  return (
    <CieIdWebViewLogin
      cieEnv={cieEnv}
      onFailure={handleFailure}
      onSuccess={handleLoginSuccess}
    />
  );
};
