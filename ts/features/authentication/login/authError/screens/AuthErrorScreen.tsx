import {
  NavigatorScreenParams,
  Route,
  useRoute
} from "@react-navigation/native";
import { useCallback } from "react";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { CieIdLoginProps } from "../../cie/components/CieIdLoginWebView";
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

const authScreenByAuthMethod = {
  CIE: AUTHENTICATION_ROUTES.CIE_PIN_SCREEN,
  SPID: AUTHENTICATION_ROUTES.IDP_SELECTION,
  CIE_ID: AUTHENTICATION_ROUTES.CIE_ID_LOGIN
};

const AuthErrorScreen = () => {
  const dispatch = useIODispatch();
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);

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
    }, [authMethod, route.params]);

  const onRetry = useCallback(() => {
    if (authMethod === "SPID") {
      dispatch(
        route.params.isNativeLogin
          ? incrementNativeLoginNativeAttempts()
          : setStandardLoginInLoadingState()
      );
    }
    navigation.navigate(AUTHENTICATION_ROUTES.MAIN, getNavigationParams());
  }, [authMethod, navigation, route.params, getNavigationParams, dispatch]);

  const onCancel = useCallback(() => {
    // TODO: review this logic in order to save the spid login value in active session login state
    dispatch(resetSpidLoginState());

    if (isActiveSessionLogin) {
      navigation.navigate(ROUTES.MAIN, {
        screen: MESSAGES_ROUTES.MESSAGES_HOME
      });
      return;
    }
    navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.LANDING
    });
  }, [isActiveSessionLogin, dispatch, navigation]);

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
