import { Route, useRoute } from "@react-navigation/native";
import React, { useCallback } from "react";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import AuthErrorScreen from "./components/AuthErrorScreen";

export type AuthErrorScreenProps = {
  errorCode?: string;
};

const CieAuthErrorScreen = () => {
  const route =
    useRoute<Route<typeof ROUTES.AUTH_ERROR_SCREEN, AuthErrorScreenProps>>();
  const { errorCode } = route.params;

  const navigation = useIONavigation();

  const onRetry = useCallback(() => {
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.CIE_PIN_SCREEN
    });
  }, [navigation]);

  const onCancel = useCallback(() => {
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_LANDING
    });
  }, [navigation]);

  return (
    <AuthErrorScreen
      onCancel={onCancel}
      onRetry={onRetry}
      errorCode={errorCode}
    />
  );
};

export default CieAuthErrorScreen;
