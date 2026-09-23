import { IdpData } from "@io-app/api-types/generated/definitions/content/IdpData";
import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useMemo } from "react";

import { LoadingScreenContent } from "../../../../../components/screens/LoadingScreenContent";
import {
  HeaderSecondLevelHookProps,
  useHeaderSecondLevel
} from "../../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { SpidIdp } from "../../../../../utils/idps";
import { trackLoginFailure } from "../../../common/analytics";
import {
  IdpWebViewLogin,
  WebViewLoginEvent
} from "../../../common/components/IdpWebViewLogin";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { AUTH_LEVELS, isValidCallbackUrl } from "../../../common/utils";
import { AUTH_ERRORS } from "../../../common/utils/authError";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess
} from "../../store/actions";
import {
  activeSessionUserLoggedSelector,
  idpSelectedActiveSessionLoginSelector
} from "../../store/selectors";
import useActiveSessionLoginNavigation from "../../utils/useActiveSessionLoginNavigation";

export const OneIdentityActiveSessionIdpLoginScreen = () => {
  const activeSessionUserLogged = useIOSelector(
    activeSessionUserLoggedSelector
  );
  const idpSelected = useIOSelector(idpSelectedActiveSessionLoginSelector);

  const headerProps: HeaderSecondLevelHookProps = useMemo(() => {
    if (activeSessionUserLogged) {
      return {
        title: "",
        canGoBack: false
      };
    }
    return {
      title: `${I18n.t("authentication.idp_login.headerTitle")} - ${
        idpSelected?.name
      }`,
      supportRequest: true
    };
  }, [activeSessionUserLogged, idpSelected?.name]);

  useHeaderSecondLevel(headerProps);

  if (!idpSelected) {
    return <LoadingScreenContent title={I18n.t("global.genericWaiting")} />;
  }

  return <OneIdentityActiveSessionIdpLoginScreenContent idp={idpSelected} />;
};

type OneIdentityActiveSessionIdpLoginScreenContentProps = {
  idp: SpidIdp;
};

const OneIdentityActiveSessionIdpLoginScreenContent = ({
  idp
}: OneIdentityActiveSessionIdpLoginScreenContentProps) => {
  const dispatch = useIODispatch();
  const navigation =
    useNavigation<IOStackNavigationProp<AuthenticationParamsList>>();

  const { forceLogoutAndNavigateToLanding } = useActiveSessionLoginNavigation();

  const navigateToAuthErrorScreen = useCallback(
    (errorCodeOrMessage?: string) => {
      // `replace` removes this screen from the stack, so that retrying
      // picks a fresh IdP from IDP_SELECTION instead of resuming this
      // failed attempt.
      navigation.replace(AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN, {
        errorCodeOrMessage,
        authMethod: "SPID",
        authLevel: AUTH_LEVELS.L2
      });
    },
    [navigation]
  );

  const handleLoginFailure = useCallback(
    (reason: string, code?: string, message?: string) => {
      if (code !== AUTH_ERRORS.ERROR_1004) {
        dispatch(activeSessionLoginFailure());
      }
      trackLoginFailure({
        reason,
        idp: idp.id as keyof IdpData,
        flow: "reauth"
      });
      navigateToAuthErrorScreen(code || message);
    },
    [dispatch, idp.id, navigateToAuthErrorScreen]
  );

  const handleLoginSuccess = useCallback(
    (token: string) => {
      dispatch(activeSessionLoginSuccess(token));
    },
    [dispatch]
  );

  const handleEvent = useCallback(
    (event: WebViewLoginEvent) => {
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
          navigateToAuthErrorScreen();
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
      navigateToAuthErrorScreen
    ]
  );

  // TODO: Remove flow to keep IdpWebViewLogin agnostic
  return <IdpWebViewLogin flow="reauth" idp={idp} onEvent={handleEvent} />;
};
