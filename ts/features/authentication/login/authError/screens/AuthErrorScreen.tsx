import {
  NavigatorScreenParams,
  Route,
  useRoute
} from "@react-navigation/native";
import { useCallback, useMemo } from "react";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import {
  incrementNativeLoginNativeAttempts,
  resetSpidLoginState,
  setStandardLoginInLoadingState
} from "../../idp/store/actions";
import { UnlockAccessProps } from "../../unlockAccess/components/UnlockAccessComponent";
import AuthErrorComponent from "../../../common/components/AuthErrorComponent";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { isActiveSessionLoginSelector } from "../../../activeSessionLogin/store/selectors";
import { SETTINGS_ROUTES } from "../../../../settings/common/navigation/routes";
import {
  setFinishedActiveSessionLoginFlow,
  setRetryActiveSessionLogin
} from "../../../activeSessionLogin/store/actions";
import { CieIdLoginProps } from "../../cie/shared/utils";
import ROUTES from "../../../../../navigation/routes";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";

type CommonAuthErrorScreenProps = {
  errorCodeOrMessage?: string;
} & UnlockAccessProps;

type SpidProps = {
  authMethod: "SPID";
  isNativeLogin?: boolean;
};

type CieIdProps = {
  authMethod: "CIE_ID";
  params: CieIdLoginProps;
};

type CieProps = {
  authMethod: "CIE";
};

export type AuthErrorScreenProps = CommonAuthErrorScreenProps &
  (SpidProps | CieProps | CieIdProps);

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

  const getNavigationParams =
    useCallback((): NavigatorScreenParams<AuthenticationParamsList> => {
      if (authMethod === "CIE_ID") {
        return {
          screen: authScreenByAuthMethod[authMethod],
          params: route.params.params
        };
      }

      return {
        screen: authScreenByAuthMethod[authMethod]
      };
    }, [authMethod, authScreenByAuthMethod, route.params]);

  const onRetry = useCallback(() => {
    if (authMethod === "SPID") {
      dispatch(
        route.params.isNativeLogin
          ? incrementNativeLoginNativeAttempts()
          : setStandardLoginInLoadingState()
      );
    }

    if (isActiveSessionLogin) {
      dispatch(setRetryActiveSessionLogin());
      navigation.replace(SETTINGS_ROUTES.AUTHENTICATION, getNavigationParams());
    } else {
      navigation.navigate(AUTHENTICATION_ROUTES.MAIN, getNavigationParams());
    }
  }, [
    authMethod,
    isActiveSessionLogin,
    dispatch,
    route.params,
    navigation,
    getNavigationParams
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
      onCancel={onCancel}
      onRetry={onRetry}
      errorCodeOrMessage={errorCodeOrMessage}
    />
  );
};

export default AuthErrorScreen;
