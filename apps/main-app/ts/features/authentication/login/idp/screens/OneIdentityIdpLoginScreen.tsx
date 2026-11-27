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
import { IdpSuccessfulAuthentication } from "../../../common/components/IdpSuccessfulAuthentication";
import { IdpWebViewLogin } from "../../../common/components/IdpWebViewLogin";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { loginFailure, loginSuccess } from "../../../common/store/actions";
import {
  loggedInAuthSelector,
  loggedOutWithIdpAuthSelector
} from "../../../common/store/selectors";
import { AUTH_LEVELS, isForbiddenOutsideIoApi } from "../../../common/utils";
import {
  getLoginFailureReason,
  LoginFailure
} from "../../../common/utils/loginFailure";

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
  const navigation =
    useNavigation<IOStackNavigationProp<AuthenticationParamsList>>();

  const navigateToAuthErrorScreen = useCallback(
    (failure: LoginFailure) => {
      // `replace` drops the failed login webview, so it doesn't stay
      // mounted behind the error screen.
      navigation.replace(AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN, {
        authMethod: "SPID",
        authLevel: AUTH_LEVELS.L2,
        failure,
        idp: idp.id
      });
    },
    [navigation, idp.id]
  );

  const handleLoginFailure = useCallback(
    (failure: LoginFailure) => {
      dispatch(
        loginFailure({
          error: new Error(getLoginFailureReason(failure)),
          idp: idp.id as keyof IdpData
        })
      );
      navigateToAuthErrorScreen(failure);
    },
    [dispatch, idp.id, navigateToAuthErrorScreen]
  );

  const handleLoginSuccess = useCallback(
    (token: string) => {
      dispatch(
        loginSuccess({
          token,
          idp: idp.id as keyof IdpData,
          isOneIdentityLogin: true
        })
      );
    },
    [dispatch, idp.id]
  );

  const handleFailure = useCallback(
    (failure: LoginFailure) => {
      switch (failure.kind) {
        case "webViewHttp":
          if (!isForbiddenOutsideIoApi(failure)) {
            navigateToAuthErrorScreen(failure);
          }
          return;
        case "webViewNative":
          navigateToAuthErrorScreen(failure);
          return;
        default:
          handleLoginFailure(failure);
      }
    },
    [handleLoginFailure, navigateToAuthErrorScreen]
  );

  return (
    <IdpWebViewLogin
      idp={idp}
      onFailure={handleFailure}
      onSuccess={handleLoginSuccess}
    />
  );
};
