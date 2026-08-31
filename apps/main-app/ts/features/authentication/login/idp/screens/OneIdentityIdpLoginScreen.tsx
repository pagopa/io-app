import { IdpData } from "@io-app/api-types/generated/definitions/content/IdpData";
import I18n from "i18next";
import { useCallback, useMemo } from "react";

import { LoadingScreenContent } from "../../../../../components/screens/LoadingScreenContent";
import { apiUrlPrefix } from "../../../../../config";
import {
  HeaderSecondLevelHookProps,
  useHeaderSecondLevel
} from "../../../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { SpidIdp } from "../../../../../utils/idps";
import { IdpSuccessfulAuthentication } from "../../../common/components/IdpSuccessfulAuthentication";
import {
  IdpWebViewLogin,
  WebViewLoginEvent
} from "../../../common/components/IdpWebViewLogin";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { loginFailure, loginSuccess } from "../../../common/store/actions";
import {
  loggedInAuthSelector,
  loggedOutWithIdpAuthSelector
} from "../../../common/store/selectors";

export const OneIdentityIdpLoginScreen = () => {
  const loggedInAuth = useIOSelector(loggedInAuthSelector);
  const loggedOutWithIdpAuth = useIOSelector(loggedOutWithIdpAuthSelector);

  const headerProps: HeaderSecondLevelHookProps = useMemo(() => {
    if (loggedInAuth) {
      return {
        title: "",
        canGoBack: false
      };
    }
    return {
      title: `${I18n.t("authentication.idp_login.headerTitle")} - ${
        loggedOutWithIdpAuth?.idp.name
      }`,
      supportRequest: true
    };
  }, [loggedInAuth, loggedOutWithIdpAuth?.idp.name]);

  useHeaderSecondLevel(headerProps);

  if (loggedInAuth) {
    return <IdpSuccessfulAuthentication />;
  }

  if (!loggedOutWithIdpAuth) {
    return <LoadingScreenContent title={I18n.t("global.genericWaiting")} />;
  }

  return <OneIdentityIdpLoginScreenContent idp={loggedOutWithIdpAuth.idp} />;
};

type OneIdentityIdpLoginScreenContentProps = {
  idp: SpidIdp;
};

const OneIdentityIdpLoginScreenContent = ({
  idp
}: OneIdentityIdpLoginScreenContentProps) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const navigateToAuthErrorScreen = useCallback(
    (errorCodeOrMessage?: string) => {
      // The choice was made to use `replace` instead of `navigate` because the former unmounts the current screen,
      // ensuring the re-execution of the `useLollipopLoginSource` hook.
      navigation.replace(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
        params: {
          errorCodeOrMessage,
          authMethod: "SPID",
          authLevel: "L2"
        }
      });
    },
    [navigation]
  );

  const handleLoginFailure = useCallback(
    (reason: string, code?: string, message?: string) => {
      dispatch(
        loginFailure({
          error: new Error(reason),
          idp: idp.id as keyof IdpData
        })
      );
      navigateToAuthErrorScreen(code ?? message);
    },
    [dispatch, idp.id, navigateToAuthErrorScreen]
  );

  const handleLoginSuccess = useCallback(
    (token: string) => {
      dispatch(loginSuccess({ token, idp: idp.id as keyof IdpData }));
    },
    [dispatch, idp.id]
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
          const { statusCode, url } = event.payload;

          if (url.includes(apiUrlPrefix) && statusCode === 403) {
            break;
          }
          navigateToAuthErrorScreen();
          break;
        }
        default:
          break;
      }
    },
    [handleLoginFailure, handleLoginSuccess, navigateToAuthErrorScreen]
  );

  // TODO: Remove flow to keep IdpWebViewLogin agnostic
  return <IdpWebViewLogin flow="auth" idp={idp} onEvent={handleEvent} />;
};
