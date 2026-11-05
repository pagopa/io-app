import { StackActions } from "@react-navigation/native";
import { useCallback } from "react";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { AuthLevel } from "../../common/utils";
import { FailureData } from "../../common/utils/loginErrorDebugInfo";
import { AUTHENTICATION_ROUTES } from "../navigation/routes";

type UseCieIdWebViewLoginNavigationProps = {
  authLevel: AuthLevel;
};

export const useCieIdWebViewLoginNavigation = ({
  authLevel
}: UseCieIdWebViewLoginNavigationProps) => {
  const navigation = useIONavigation();

  const navigateToCieIdAuthenticationError = useCallback(
    (failureData: FailureData) => {
      navigation.dispatch(
        StackActions.replace(AUTHENTICATION_ROUTES.CIE_ID_ERROR, {
          failureData
        })
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
    (errorCodeOrMessage: string | undefined, failureData: FailureData) => {
      // `replace` drops the failed login screen, so retrying mounts a new
      // one, with a new Lollipop key, instead of popping back to it.
      // Dispatched as an action because `navigation` is typed on the root
      // params list.
      navigation.dispatch(
        StackActions.replace(AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN, {
          errorCodeOrMessage,
          authMethod: "CIE_ID",
          authLevel,
          failureData
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
