import {
  NavigatorScreenParams,
  Route,
  useRoute
} from "@react-navigation/native";
import { useCallback } from "react";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import ROUTES from "../../navigation/routes";
import { CieIdLoginProps } from "../../features/cieLogin/components/CieIdLoginWebView";
import { AuthenticationParamsList } from "../../navigation/params/AuthenticationParamsList";
import { UnlockAccessProps } from "./UnlockAccessComponent";
import AuthErrorComponent from "./components/AuthErrorComponent";

type CommonAuthErrorScreenProps = {
  errorCodeOrMessage?: string;
} & UnlockAccessProps;

type SpidProps = {
  authMethod: "SPID";
  onRetry: () => void;
};

type CieIdProps = {
  authMethod: "CIE_ID";
  onRetry?: () => void;
  params: CieIdLoginProps;
};

type CieProps = {
  authMethod: "CIE";
};

export type AuthErrorScreenProps = CommonAuthErrorScreenProps &
  (SpidProps | CieProps | CieIdProps);

const authScreenByAuthMethod = {
  CIE: ROUTES.CIE_PIN_SCREEN,
  SPID: ROUTES.AUTHENTICATION_IDP_SELECTION,
  CIE_ID: ROUTES.AUTHENTICATION_CIE_ID_LOGIN
};

const AuthErrorScreen = () => {
  const route =
    useRoute<Route<typeof ROUTES.AUTH_ERROR_SCREEN, AuthErrorScreenProps>>();
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
    if (authMethod === "SPID" || authMethod === "CIE_ID") {
      route.params.onRetry?.();
    }
    navigation.navigate(ROUTES.AUTHENTICATION, getNavigationParams());
  }, [authMethod, navigation, route.params, getNavigationParams]);

  const onCancel = useCallback(() => {
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_LANDING
    });
  }, [navigation]);

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
