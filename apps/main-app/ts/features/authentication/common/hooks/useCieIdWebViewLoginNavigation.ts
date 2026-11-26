import { StackActions } from "@react-navigation/native";
import { useCallback } from "react";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { AuthLevel } from "../../common/utils";
import { LoginFailure } from "../../common/utils/loginFailure";
import { AUTHENTICATION_ROUTES } from "../navigation/routes";

type UseCieIdWebViewLoginNavigationProps = {
  authLevel: AuthLevel;
};

export const useCieIdWebViewLoginNavigation = ({
  authLevel
}: UseCieIdWebViewLoginNavigationProps) => {
  const navigation = useIONavigation();

  const navigateToCieIdAuthenticationError = useCallback(
    (failure: LoginFailure) => {
      navigation.dispatch(
        StackActions.replace(AUTHENTICATION_ROUTES.CIE_ID_ERROR, { failure })
      );
    },
    [navigation]
  );

  const navigateToCieIdAuthUrlError = useCallback(
    (url: string) => {
      navigation.dispatch(
        StackActions.replace(AUTHENTICATION_ROUTES.CIE_ID_INCORRECT_URL, {
          url
        })
      );
    },
    [navigation]
  );

  const navigateToAuthErrorScreen = useCallback(
    (failure: LoginFailure) => {
      // `replace` drops the failed login screen, so retrying mounts a new
      // one, with a new Lollipop key, instead of popping back to it.
      // Dispatched as an action because `navigation` is typed on the root
      // params list.
      navigation.dispatch(
        StackActions.replace(AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN, {
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
