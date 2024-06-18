import { Route, useRoute } from "@react-navigation/native";
import React, { useCallback } from "react";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import ROUTES from "../../navigation/routes";
import { UnlockAccessProps } from "./UnlockAccessComponent";
import AuthErrorComponent from "./components/AuthErrorComponent";

type CommonAuthErrorScreenProps = {
  errorCode?: string;
  authMethod: "SPID" | "CIE";
} & UnlockAccessProps;

type SpidProps = {
  authMethod: "SPID";
  onRetrySpid: () => void;
};

type CieProps = {
  authMethod: "CIE";
  onRetrySpid?: never;
};

export type AuthErrorScreenProps = CommonAuthErrorScreenProps &
  (SpidProps | CieProps);

const AuthErrorScreen = () => {
  const route =
    useRoute<Route<typeof ROUTES.AUTH_ERROR_SCREEN, AuthErrorScreenProps>>();
  const { errorCode, authMethod, authLevel, onRetrySpid } = route.params;

  const navigation = useIONavigation();

  const onRetry = useCallback(() => {
    if (authMethod === "SPID") {
      onRetrySpid();
    }
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen:
        authMethod === "CIE"
          ? ROUTES.CIE_PIN_SCREEN
          : ROUTES.AUTHENTICATION_IDP_SELECTION
    });
  }, [authMethod, navigation, onRetrySpid]);

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
      errorCode={errorCode}
    />
  );
};

export default AuthErrorScreen;
