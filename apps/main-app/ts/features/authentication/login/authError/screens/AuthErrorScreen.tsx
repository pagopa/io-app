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

    // The active session login flow pushes its own instance of this same
    // nested authentication navigator (from Settings), so `navigation`
    // always refers to whichever instance currently renders this screen:
    // the same local navigation works for both the first-login and the
    // active session flows.
    switch (authMethod) {
      case "CIE":
        // The CIE PIN screen navigates to this one with `navigate`, so it's
        // still in the stack, possibly with a card reader screen on top of
        // it: `navigate` to an existing route pops back to it instead of
        // pushing a new instance.
        navigation.navigate(authScreenByAuthMethod.CIE);
        break;
      case "CIE_ID":
        // CIE_ID_LOGIN reaches this screen via `replace`, so it's no
        // longer in the stack: it has to be recreated to retry, which also
        // re-triggers the Lollipop key generation on mount.
        navigation.replace(authScreenByAuthMethod.CIE_ID);
        break;
      case "SPID":
        // `navigate` to IDP_SELECTION works regardless of how this screen
        // was reached: when it's still in the stack (OneIdentity, which
        // reaches this screen with a local `navigate`), it pops back to
        // that existing instance; when it isn't (legacy entry points,
        // which still collapse the stack with `replace(MAIN, ...)`),
        // `navigate` just pushes a fresh one. Either way the user lands on
        // a working IDP_SELECTION to pick an IdP again.
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
      // The active session login flow is entered with `push`, so `MAIN` is
      // already below it in the stack: `navigate` to it pops the whole
      // pushed Settings/Authentication stack instead of pushing a new
      // instance, so no `reset` is needed here.
      navigation.navigate(ROUTES.MAIN, {
        screen: MESSAGES_ROUTES.MESSAGES_HOME
      });
      return;
    }

    dispatch(resetSpidLoginState());
    // `reset` (instead of `popToTop`) sets the stack directly to LANDING
    // regardless of what's currently in it: unlike the other entry points,
    // legacy screens still remount this navigator down to a single
    // AUTH_ERROR_SCREEN route on error, so `popToTop` would be a no-op here.
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
