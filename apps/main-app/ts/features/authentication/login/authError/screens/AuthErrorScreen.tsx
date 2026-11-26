import { useCallback, useMemo } from "react";

import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { useAvoidHardwareBackButton } from "../../../../../utils/useAvoidHardwareBackButton";
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
import { LoginFailure } from "../../../common/utils/loginFailure";
import {
  resetSpidLoginState,
  setSpidLoginInLoadingState
} from "../../idp/store/actions";

export type AuthErrorScreenParams = {
  authLevel: AuthLevel;
  authMethod: AuthMethod;
  /** The login failure: it selects the content and is shown in debug mode. */
  failure?: LoginFailure;
  /** The SPID IdP of the failed login, shown in debug mode. */
  idp?: string;
};

export type AuthMethod = "CIE" | "CIE_ID" | "SPID";

type AuthErrorScreenProps = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  typeof AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN
>;

const AuthErrorScreen = ({ navigation, route }: AuthErrorScreenProps) => {
  useAvoidHardwareBackButton();

  const { authMethod, authLevel, failure, idp } = route.params;

  const dispatch = useIODispatch();
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);

  const screenDebugInfo = useMemo(
    () => ({ authMethod, authLevel, failure, idp }),
    [authMethod, authLevel, failure, idp]
  );
  useDebugInfo(screenDebugInfo);

  const handleRetry = useCallback(() => {
    if (isActiveSessionLogin) {
      dispatch(setRetryActiveSessionLogin());
    }

    switch (authMethod) {
      case "CIE":
        // CIE_PIN_SCREEN is still in the stack, below the card reader:
        // `popTo` pops back to it instead of pushing a new instance.
        navigation.popTo(AUTHENTICATION_ROUTES.CIE_PIN_SCREEN);
        break;
      case "CIE_ID":
        // CIE_ID_LOGIN reaches this screen via `replace`, so it's no
        // longer in the stack: it has to be recreated to retry, which also
        // re-triggers the Lollipop key generation on mount.
        navigation.replace(
          isActiveSessionLogin
            ? AUTHENTICATION_ROUTES.CIE_ID_ACTIVE_SESSION_LOGIN
            : AUTHENTICATION_ROUTES.CIE_ID_LOGIN
        );
        break;
      case "SPID":
        dispatch(setSpidLoginInLoadingState());
        // Lets the user pick an IdP again from IDP_SELECTION: `popTo`
        // pops back to it.
        navigation.popTo(AUTHENTICATION_ROUTES.IDP_SELECTION);
        break;
    }
  }, [authMethod, isActiveSessionLogin, dispatch, navigation]);

  const handleCancel = useCallback(() => {
    if (isActiveSessionLogin) {
      dispatch(setFinishedActiveSessionLoginFlow());
      // Navigating back to the main route of the app,
      // specifically to the Messages home.
      navigation.popTo(ROUTES.MAIN, {
        screen: MESSAGES_ROUTES.MESSAGES_HOME
      });
      return;
    }

    dispatch(resetSpidLoginState());
    // LANDING is the initial route of this stack in the first-login flow:
    // `popTo` pops back to it without remounting it.
    navigation.popTo(AUTHENTICATION_ROUTES.LANDING);
  }, [dispatch, isActiveSessionLogin, navigation]);

  return (
    <AuthErrorComponent
      authLevel={authLevel}
      failure={failure}
      onCancel={handleCancel}
      onRetry={handleRetry}
    />
  );
};

export default AuthErrorScreen;
