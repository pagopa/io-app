import {
  NavigatorScreenParams,
  Route,
  useRoute
} from "@react-navigation/native";
import { useCallback, useMemo } from "react";
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
import AuthErrorComponent, {
  AUTH_ERRORS
} from "../../../common/components/AuthErrorComponent";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { isActiveSessionLoginSelector } from "../../../activeSessionLogin/store/selectors";
import { SETTINGS_ROUTES } from "../../../../settings/common/navigation/routes";
import {
  setFinishedActiveSessionLoginFlow,
  setRetryActiveSessionLogin
} from "../../../activeSessionLogin/store/actions";

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
    // TODO: review this logic in order to save the spid login value in active session login state
    dispatch(resetSpidLoginState());

    if (
      isActiveSessionLogin &&
      errorCodeOrMessage !== AUTH_ERRORS.NOT_SAME_CF
    ) {
      dispatch(setFinishedActiveSessionLoginFlow());
      // allows the user to return to the screen from which the flow began
      navigation.popToTop();
      return;
    }
    navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.LANDING
    });
  }, [dispatch, isActiveSessionLogin, errorCodeOrMessage, navigation]);

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
