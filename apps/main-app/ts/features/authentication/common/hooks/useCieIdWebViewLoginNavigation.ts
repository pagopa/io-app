import { useCallback } from "react";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { AuthLevel } from "../../common/utils";
import { AUTHENTICATION_ROUTES } from "../navigation/routes";

type UseCieIdWebViewLoginNavigationProps = {
  authLevel: AuthLevel;
  isUat: boolean;
};

export const useCieIdWebViewLoginNavigation = ({
  authLevel,
  isUat
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
      // The choice was made to use `replace` instead of `navigate` because the former unmounts the current screen,
      // ensuring the re-execution of the `useOneIdentityLoginSource` hook.
      navigation.replace(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
        params: {
          errorCodeOrMessage,
          authMethod: "CIE_ID",
          authLevel,
          params: { spidLevel: authLevel, isUat }
        }
      });
    },
    [navigation, authLevel, isUat]
  );

  return {
    navigateToCieIdAuthenticationError,
    navigateToCieIdAuthUrlError,
    navigateToAuthErrorScreen
  };
};
