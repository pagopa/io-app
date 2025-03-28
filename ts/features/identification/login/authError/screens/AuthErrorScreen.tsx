import {
  NavigatorScreenParams,
  Route,
  useRoute
} from "@react-navigation/native";
import { useCallback } from "react";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { CieIdLoginProps } from "../../cie/components/CieIdLoginWebView";
import { IdentificationParamsList } from "../../../common/navigation/params/IdentificationParamsList";
import { useIODispatch } from "../../../../../store/hooks";
import {
  incrementNativeLoginNativeAttempts,
  resetSpidLoginState,
  setStandardLoginInLoadingState
} from "../../idp/store/actions";
import { UnlockAccessProps } from "../../unlockAccess/components/UnlockAccessComponent";
import AuthErrorComponent from "../../../common/components/AuthErrorComponent";
import { IDENTIFICATION_ROUTES } from "../../../common/navigation/routes";

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
  CIE: IDENTIFICATION_ROUTES.CIE_PIN_SCREEN,
  SPID: IDENTIFICATION_ROUTES.IDP_SELECTION,
  CIE_ID: IDENTIFICATION_ROUTES.CIE_ID_LOGIN
};

const AuthErrorScreen = () => {
  const dispatch = useIODispatch();
  const route =
    useRoute<
      Route<
        typeof IDENTIFICATION_ROUTES.AUTH_ERROR_SCREEN,
        AuthErrorScreenProps
      >
    >();
  const { errorCodeOrMessage, authMethod, authLevel } = route.params;

  const navigation = useIONavigation();

  const getNavigationParams =
    useCallback((): NavigatorScreenParams<IdentificationParamsList> => {
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
    navigation.navigate(IDENTIFICATION_ROUTES.MAIN, getNavigationParams());
  }, [authMethod, navigation, route.params, getNavigationParams, dispatch]);

  const onCancel = useCallback(() => {
    dispatch(resetSpidLoginState());
    navigation.navigate(IDENTIFICATION_ROUTES.MAIN, {
      screen: IDENTIFICATION_ROUTES.LANDING
    });
  }, [navigation, dispatch]);

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
