import { Route, useRoute } from "@react-navigation/native";
import React, { useCallback } from "react";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { UnlockAccessProps } from "../UnlockAccessComponent";
import AuthErrorComponent from "./components/AuthErrorComponent";

export type AuthErrorScreenProps = {
  errorCode?: string;
  authMethod: "SPID" | "CIE";
} & UnlockAccessProps;

const AuthErrorScreen = () => {
  const route =
    useRoute<Route<typeof ROUTES.AUTH_ERROR_SCREEN, AuthErrorScreenProps>>();
  const { errorCode, authMethod, authLevel } = route.params;

  const navigation = useIONavigation();

  const onRetry = useCallback(() => {
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen:
        authMethod === "CIE"
          ? ROUTES.CIE_PIN_SCREEN
          : ROUTES.AUTHENTICATION_IDP_SELECTION
    });
  }, [authMethod, navigation]);

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
