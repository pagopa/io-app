import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";

import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../../navigation/routes";
import { useIODispatch } from "../../../../../store/hooks";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import { trackLoginFailure } from "../../../common/analytics";
import {
  trackLoginCieConsentDataUsageScreen,
  trackLoginCieDataSharingError
} from "../../../common/analytics/cieAnalytics";
import { CieWebViewLogin } from "../../../common/components/CieWebViewLogin";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import {
  AUTH_LEVELS,
  isValidCallbackUrl,
  LOGIN_TYPES
} from "../../../common/utils";
import { AUTH_ERRORS } from "../../../common/utils/authError";
import {
  getLoginFailureReason,
  LoginFailure
} from "../../../common/utils/loginFailure";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess,
  logoutBeforeSessionCorrupted,
  setFinishedActiveSessionLoginFlow
} from "../../store/actions";

type OneIdentityActiveSessionLoginCieAuthorizationWebViewProps = {
  authorizationUrl: string;
};

export const OneIdentityActiveSessionLoginCieAuthorizationWebView = ({
  authorizationUrl
}: OneIdentityActiveSessionLoginCieAuthorizationWebViewProps) => {
  const dispatch = useIODispatch();
  const navigation =
    useNavigation<IOStackNavigationProp<AuthenticationParamsList>>();

  const handleGoBack = useCallback(() => {
    dispatch(setFinishedActiveSessionLoginFlow());
    navigation.popTo(ROUTES.MAIN, {
      screen: MESSAGES_ROUTES.MESSAGES_HOME
    });
  }, [dispatch, navigation]);

  useHeaderSecondLevel({ title: "", goBack: handleGoBack });

  useOnFirstRender(() => {
    trackLoginCieConsentDataUsageScreen(LOGIN_TYPES.REAUTH);
  });

  const forceLogoutAndNavigateToLanding = useCallback(() => {
    dispatch(logoutBeforeSessionCorrupted());
    navigation.replace(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.LANDING
    });
  }, [dispatch, navigation]);

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
      const isDifferentFiscalCode =
        failure.kind === "backend" &&
        failure.details.errorCode === AUTH_ERRORS.ERROR_1004;
      const isDataSharingDenied =
        failure.kind === "backend" &&
        failure.details.errorCode === AUTH_ERRORS.ERROR_22;

      if (!isDifferentFiscalCode) {
        dispatch(activeSessionLoginFailure());
      }

      if (isDataSharingDenied) {
        trackLoginCieDataSharingError(LOGIN_TYPES.REAUTH);
      }

      trackLoginFailure({
        reason: getLoginFailureReason(failure),
        idp: "cie",
        flow: LOGIN_TYPES.REAUTH
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
        case "webViewHttp": {
          const { statusCode, url } = failure.details;
          if (isValidCallbackUrl(url)) {
            // The callback URL failed to load: force a logout.
            forceLogoutAndNavigateToLanding();
          } else if (statusCode !== 403) {
            handleLoginFailure(failure);
          }
          return;
        }
        default:
          handleLoginFailure(failure);
      }
    },
    [forceLogoutAndNavigateToLanding, handleLoginFailure]
  );

  return (
    <CieWebViewLogin
      flow={LOGIN_TYPES.REAUTH}
      onFailure={handleFailure}
      onSuccess={handleLoginSuccess}
      url={authorizationUrl}
    />
  );
};
