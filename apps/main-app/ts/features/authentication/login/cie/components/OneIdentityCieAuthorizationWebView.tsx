import { IdpData } from "@io-app/api-types/generated/definitions/content/IdpData";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";

import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { useOnboardingAbortAlert } from "../../../../onboarding/hooks/useOnboardingAbortAlert";
import { OneIdentityActiveSessionLoginCieAuthorizationWebView } from "../../../activeSessionLogin/screens/cie/OneIdentityActiveSessionLoginCieAuthorizationWebView";
import {
  trackLoginCieConsentDataUsageScreen,
  trackLoginCieDataSharingError
} from "../../../common/analytics/cieAnalytics";
import { CieWebViewLogin } from "../../../common/components/CieWebViewLogin";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { loginFailure, loginSuccess } from "../../../common/store/actions";
import { AUTH_LEVELS, LOGIN_TYPES } from "../../../common/utils";
import { AUTH_ERRORS } from "../../../common/utils/authError";
import { LoginType } from "../../../common/utils/index";
import {
  getLoginFailureReason,
  LoginFailure
} from "../../../common/utils/loginFailure";

type OneIdentityCieAuthorizationWebViewProps = {
  authorizationUrl: string;
  flow: LoginType;
};

/**
 * Component responsible for handling the One Identity CIE authorization web
 * view. It checks for an active session login and renders the appropriate
 * content component.
 */
export const OneIdentityCieAuthorizationWebView = ({
  authorizationUrl,
  flow
}: OneIdentityCieAuthorizationWebViewProps) => {
  // If the login flow is not the standard auth,
  // render the active session login web view.
  if (flow !== LOGIN_TYPES.AUTH) {
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
        navigation.popTo(AUTHENTICATION_ROUTES.LANDING);
      }),
    [showAlert, navigation]
  );

  useHeaderSecondLevel({ title: "", goBack: handleGoBack });

  useOnFirstRender(() => {
    trackLoginCieConsentDataUsageScreen();
  });

  const navigateToAuthErrorScreen = useCallback(
    (failure: LoginFailure) =>
      navigation.replace(AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN, {
        authMethod: "CIE",
        authLevel: AUTH_LEVELS.L3,
        failure
      }),
    [navigation]
  );

  const handleLoginFailure = useCallback(
    (failure: LoginFailure) => {
      const isDataSharingDenied =
        failure.kind === "backend" &&
        failure.details.errorCode === AUTH_ERRORS.ERROR_22;
      if (isDataSharingDenied) {
        trackLoginCieDataSharingError();
      }

      dispatch(
        loginFailure({
          error: new Error(getLoginFailureReason(failure)),
          idp: "cie" as keyof IdpData
        })
      );
      navigateToAuthErrorScreen(failure);
    },
    [dispatch, navigateToAuthErrorScreen]
  );

  const handleLoginSuccess = useCallback(
    (token: string) => {
      dispatch(
        loginSuccess({
          token,
          idp: "cie" as keyof IdpData,
          isOneIdentityLogin: true
        })
      );
    },
    [dispatch]
  );

  return (
    <CieWebViewLogin
      onFailure={handleLoginFailure}
      onSuccess={handleLoginSuccess}
      url={authorizationUrl}
    />
  );
};
