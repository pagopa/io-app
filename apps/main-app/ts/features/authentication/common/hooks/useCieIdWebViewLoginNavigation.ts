import { StackActions } from "@react-navigation/native";
import { useCallback } from "react";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { AuthLevel } from "../../common/utils";
import { AuthErrorFailure } from "../../login/authError/screens/AuthErrorScreen";
import { AUTHENTICATION_ROUTES } from "../navigation/routes";
import { LoginFailure } from "../utils/loginFailureDebugInfo";

type UseCieIdWebViewLoginNavigationProps = {
  authLevel: AuthLevel;
};

export const useCieIdWebViewLoginNavigation = ({
  authLevel
}: UseCieIdWebViewLoginNavigationProps) => {
  const navigation = useIONavigation();

  const navigateToCieIdAuthenticationError = useCallback(
    (failure?: LoginFailure) => {
      navigation.replace(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.CIE_ID_ERROR,
        params: { failure }
      });
    },
    [navigation]
  );

  const navigateToCieIdAuthUrlError = useCallback(
    (url: string) => {
      navigation.replace(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.CIE_ID_INCORRECT_URL,
        params: { url }
      });
    },
    [navigation]
  );

  const navigateToAuthErrorScreen = useCallback(
    (errorCodeOrMessage?: string, failure?: AuthErrorFailure) => {
      // `replace` drops the failed login screen, so retrying mounts a new
      // one, with a new Lollipop key, instead of popping back to it.
      // Dispatched as an action because `navigation` is typed on the root
      // params list.
      navigation.dispatch(
        StackActions.replace(AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN, {
          errorCodeOrMessage,
          authMethod: "CIE_ID",
          authLevel,
          failure
        })
      );
    },
    [navigation, authLevel]
  );

  return {
    navigateToCieIdAuthenticationError,
    navigateToCieIdAuthUrlError,
    navigateToAuthErrorScreen
  };
};
