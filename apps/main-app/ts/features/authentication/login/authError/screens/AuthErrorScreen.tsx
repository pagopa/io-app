import { Route, useRoute } from "@react-navigation/native";
import { useCallback, useMemo } from "react";

import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import { SETTINGS_ROUTES } from "../../../../settings/common/navigation/routes";
import {
  setFinishedActiveSessionLoginFlow,
  setRetryActiveSessionLogin
} from "../../../activeSessionLogin/store/actions";
import { isActiveSessionLoginSelector } from "../../../activeSessionLogin/store/selectors";
import AuthErrorComponent from "../../../common/components/AuthErrorComponent";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { AuthLevel } from "../../../common/utils";
import {
  resetSpidLoginState,
  setSpidLoginInLoadingState
} from "../../idp/store/actions";

export type AuthErrorScreenProps = {
  authLevel: AuthLevel;
  authMethod: AuthMethod;
  errorCodeOrMessage?: string;
};
export type AuthMethod = "CIE" | "CIE_ID" | "SPID";

const AuthErrorScreen = () => {
  const dispatch = useIODispatch();
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);

  const authScreenByAuthMethod = useMemo(
    () => ({
      CIE: AUTHENTICATION_ROUTES.CIE_PIN_SCREEN,
      SPID: AUTHENTICATION_ROUTES.IDP_SELECTION,
      CIE_ID: isActiveSessionLogin
        ? AUTHENTICATION_ROUTES.CIE_ID_ACTIVE_SESSION_LOGIN
        : AUTHENTICATION_ROUTES.CIE_ID_LOGIN
    }),
    [isActiveSessionLogin]
  );

  const route =
    useRoute<
      Route<
        typeof AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
        AuthErrorScreenProps
      >
    >();
  const { errorCodeOrMessage, authMethod, authLevel } = route.params;

  const navigation = useIONavigation();

  const onRetry = useCallback(() => {
    if (authMethod === "SPID") {
      dispatch(setSpidLoginInLoadingState());
    }

    const navigationParams = {
      screen: authScreenByAuthMethod[authMethod]
    };

    if (isActiveSessionLogin) {
      dispatch(setRetryActiveSessionLogin());
      navigation.replace(SETTINGS_ROUTES.AUTHENTICATION, navigationParams);
    } else {
      navigation.navigate(AUTHENTICATION_ROUTES.MAIN, navigationParams);
    }
  }, [
    authMethod,
    authScreenByAuthMethod,
    isActiveSessionLogin,
    dispatch,
    navigation
  ]);

  const onCancel = useCallback(() => {
    if (isActiveSessionLogin) {
      dispatch(setFinishedActiveSessionLoginFlow());
      navigation.navigate(ROUTES.MAIN, {
        screen: MESSAGES_ROUTES.MESSAGES_HOME
      });
      return;
    }

    dispatch(resetSpidLoginState());
    navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.LANDING
    });
  }, [dispatch, isActiveSessionLogin, navigation]);

  return (
    <AuthErrorComponent
      authLevel={authLevel}
      errorCodeOrMessage={errorCodeOrMessage}
      onCancel={onCancel}
      onRetry={onRetry}
    />
  );
};

export default AuthErrorScreen;
