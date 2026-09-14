import { useCallback } from "react";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { AUTHENTICATION_ROUTES } from "../../common/navigation/routes";
import { CieCardReaderScreenNavigationParams } from "../../login/cie/screens/CieCardReaderScreen";
import { CieConsentDataUsageScreenNavigationParams } from "../../login/cie/screens/CieConsentDataUsageScreen";
import {
  logoutBeforeSessionCorrupted,
  setFinishedActiveSessionLoginFlow
} from "../store/actions";
import {
  cieLoginFlowSelector,
  isActiveSessionLoginSelector
} from "../store/selectors";

const useActiveSessionLoginNavigation = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);
  const loginType = useIOSelector(cieLoginFlowSelector);

  const navigateToAuthenticationScreen = useCallback(() => {
    if (isActiveSessionLogin) {
      dispatch(setFinishedActiveSessionLoginFlow());
      navigation.navigate(ROUTES.MAIN, {
        screen: MESSAGES_ROUTES.MESSAGES_HOME
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: AUTHENTICATION_ROUTES.MAIN }]
      });
    }
  }, [dispatch, isActiveSessionLogin, navigation]);

  const navigateToCieCardReaderScreen = ({
    ciePin,
    authorizationUri
  }: CieCardReaderScreenNavigationParams) => {
    const params = {
      ciePin,
      authorizationUri
    };

    if (loginType === "auth") {
      navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.CIE_CARD_READER_SCREEN,
        params
      });
    } else {
      navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
        screen:
          AUTHENTICATION_ROUTES.CIE_CARD_READER_SCREEN_ACTIVE_SESSION_LOGIN,
        params: { ...params, loginType }
      });
    }
  };

  const navigateToCieConsentDataUsage = ({
    cieConsentUri
  }: CieConsentDataUsageScreenNavigationParams) => {
    const params = {
      cieConsentUri
    };

    if (loginType === "auth") {
      navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
        screen: AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE,
        params
      });
    } else {
      navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
        screen:
          AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE_ACTIVE_SESSION_LOGIN,
        params: { ...params, loginType }
      });
    }
  };

  const forceLogoutAndNavigateToLanding = () => {
    dispatch(logoutBeforeSessionCorrupted());
    navigation.replace(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.LANDING
    });
  };

  return {
    navigateToAuthenticationScreen,
    navigateToCieCardReaderScreen,
    navigateToCieConsentDataUsage,
    forceLogoutAndNavigateToLanding
  };
};

export default useActiveSessionLoginNavigation;
