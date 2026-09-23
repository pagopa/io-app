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
      // A local, non-`MAIN`-targeting `replace` keeps the unmount confined
      // to this screen instead of remounting the whole nested navigator.
      // `dispatch` (instead of retyping `navigation` to the local
      // `AuthenticationParamsList`) avoids affecting the other calls above,
      // which still need to target `MAIN`. `AuthErrorScreen`'s CIE_ID retry
      // replaces back to this route, which still re-triggers the Lollipop
      // key generation on mount.
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
