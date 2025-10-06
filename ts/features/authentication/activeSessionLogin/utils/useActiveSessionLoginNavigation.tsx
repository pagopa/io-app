import { useCallback } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { AUTHENTICATION_ROUTES } from "../../common/navigation/routes";
import { isActiveSessionLoginSelector } from "../store/selectors";
import { setFinishedActiveSessionLoginFlow } from "../store/actions";
import { CieCardReaderScreenNavigationParams } from "../../login/cie/screens/CieCardReaderScreen";
import { CieConsentDataUsageScreenNavigationParams } from "../../login/cie/screens/CieConsentDataUsageScreen";
import ROUTES from "../../../../navigation/routes";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { sessionCorrupted } from "../../common/store/actions";

const useActiveSessionLoginNavigation = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);

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
    const route = isActiveSessionLogin
      ? AUTHENTICATION_ROUTES.CIE_CARD_READER_SCREEN_ACTIVE_SESSION_LOGIN
      : AUTHENTICATION_ROUTES.CIE_CARD_READER_SCREEN;

    navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: route,
      params: {
        ciePin,
        authorizationUri
      }
    });
  };

  const navigateToCieConsentDataUsage = ({
    cieConsentUri
  }: CieConsentDataUsageScreenNavigationParams) => {
    const route = isActiveSessionLogin
      ? AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE_ACTIVE_SESSION_LOGIN
      : AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE;

    navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: route,
      params: {
        cieConsentUri
      }
    });
  };

  const forceLogoutAndNavigateToLanding = () => {
    dispatch(sessionCorrupted());
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
