import { StackActions } from "@react-navigation/native";
import { useCallback } from "react";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { AuthLevel } from "../../common/utils";
import { AUTHENTICATION_ROUTES } from "../navigation/routes";

type UseCieIdWebViewLoginNavigationProps = {
  authLevel: AuthLevel;
};

export const useCieIdWebViewLoginNavigation = ({
  authLevel
}: UseCieIdWebViewLoginNavigationProps) => {
  const navigation = useIONavigation();

  const navigateToCieIdAuthenticationError = useCallback(() => {
    navigation.replace(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_ID_ERROR
    });
  }, [navigation]);

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
    (errorCodeOrMessage?: string) => {
      // `replace` swaps this screen for AuthErrorScreen, so retrying can
      // recreate it and re-trigger the Lollipop key generation on mount.
      // Dispatched directly, rather than through `navigation.replace`, to
      // leave `navigation`'s type untouched for the other two calls above.
      navigation.dispatch(
        StackActions.replace(AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN, {
          errorCodeOrMessage,
          authMethod: "CIE_ID",
          authLevel
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
