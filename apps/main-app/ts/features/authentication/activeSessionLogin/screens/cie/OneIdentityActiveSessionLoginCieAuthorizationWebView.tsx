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
import {
  CieWebViewLogin,
  CieWebViewLoginEvent
} from "../../../common/components/CieWebViewLogin";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { AUTH_LEVELS, isValidCallbackUrl } from "../../../common/utils";
import { AUTH_ERRORS } from "../../../common/utils/authError";
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
    navigation.navigate(ROUTES.MAIN, {
      screen: MESSAGES_ROUTES.MESSAGES_HOME
    });
  }, [dispatch, navigation]);

  useHeaderSecondLevel({ title: "", goBack: handleGoBack });

  useOnFirstRender(() => {
    trackLoginCieConsentDataUsageScreen("reauth");
  });

  const forceLogoutAndNavigateToLanding = useCallback(() => {
    dispatch(logoutBeforeSessionCorrupted());
    navigation.replace(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.LANDING
    });
  }, [dispatch, navigation]);

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
      const errorCodeOrMessage = code ?? message;

      if (code !== AUTH_ERRORS.ERROR_1004) {
        dispatch(activeSessionLoginFailure());
      }

      if (code === AUTH_ERRORS.ERROR_22) {
        trackLoginCieDataSharingError("reauth");
      }

      trackLoginFailure({ reason, idp: "cie", flow: "reauth" });
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

          if (isValidCallbackUrl(url)) {
            // The callback URL failed to load: force a logout.
            forceLogoutAndNavigateToLanding();
            break;
          }
          if (statusCode !== 403) {
            handleLoginFailure(
              `WebView HTTP error ${statusCode} for URL ${url}`
            );
            break;
          }
          break;
        }
        default:
          break;
      }
    },
    [handleLoginFailure, handleLoginSuccess, forceLogoutAndNavigateToLanding]
  );

  return (
    <CieWebViewLogin
      flow="reauth"
      onEvent={handleEvent}
      url={authorizationUrl}
    />
  );
};
