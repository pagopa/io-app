import { Route, useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useMemo } from "react";

import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import {
  setFinishedActiveSessionLoginFlow,
  setRetryActiveSessionLogin
} from "../../../activeSessionLogin/store/actions";
import { isActiveSessionLoginSelector } from "../../../activeSessionLogin/store/selectors";
import AuthErrorComponent from "../../../common/components/AuthErrorComponent";
import { AuthenticationParamsList } from "../../../common/navigation/params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import { AuthLevel } from "../../../common/utils";
import { getAuthErrorDetails } from "../../../common/utils/authError";
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

  const debugInfo = useMemo(() => {
    const { title } = getAuthErrorDetails(errorCodeOrMessage);
    return {
      errorCodeOrMessage,
      errorTitle: title,
      authMethod,
      authLevel
    };
  }, [errorCodeOrMessage, authMethod, authLevel]);
  useDebugInfo(debugInfo);

  const navigation =
    useNavigation<IOStackNavigationProp<AuthenticationParamsList>>();

  const onRetry = useCallback(() => {
    if (authMethod === "SPID") {
      dispatch(setSpidLoginInLoadingState());
    }

    if (isActiveSessionLogin) {
      dispatch(setRetryActiveSessionLogin());
    }

    switch (authMethod) {
      case "CIE":
        // CIE_PIN_SCREEN is still in the stack, below the card reader:
        // `navigate` pops back to it instead of pushing a new instance.
        navigation.navigate(authScreenByAuthMethod.CIE);
        break;
      case "CIE_ID":
        // CIE_ID_LOGIN reaches this screen via `replace`, so it's no
        // longer in the stack: it has to be recreated to retry, which also
        // re-triggers the Lollipop key generation on mount.
        navigation.replace(authScreenByAuthMethod.CIE_ID);
        break;
      case "SPID":
        // Lets the user pick an IdP again from IDP_SELECTION: `navigate`
        // pops back to it.
        navigation.navigate(authScreenByAuthMethod.SPID);
        break;
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
      // Navigating back to the Messages home collapses the whole pushed
      // Settings/Authentication stack in one step, since it's already
      // mounted below it: no explicit reset is needed here.
      navigation.navigate(ROUTES.MAIN, {
        screen: MESSAGES_ROUTES.MESSAGES_HOME
      });
      return;
    }

    dispatch(resetSpidLoginState());
    // `reset` sets the stack directly to LANDING regardless of what's
    // currently in it, so it works even when legacy entry points have
    // already collapsed it down to a single AUTH_ERROR_SCREEN route.
    navigation.reset({
      index: 0,
      routes: [{ name: AUTHENTICATION_ROUTES.LANDING }]
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
