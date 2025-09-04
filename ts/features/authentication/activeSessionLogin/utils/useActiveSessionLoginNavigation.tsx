import { useCallback } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { AUTHENTICATION_ROUTES } from "../../common/navigation/routes";
import { isActiveSessionLoginSelector } from "../store/selectors";
import { setFinishedActiveSessionLoginFlow } from "../store/actions";
import { CieCardReaderScreenNavigationParams } from "../../login/cie/screens/CieCardReaderScreen";
import { CieConsentDataUsageScreenNavigationParams } from "../../login/cie/screens/CieConsentDataUsageScreen";

const useActiveSessionLoginNavigation = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);

  const navigateToAuthenticationScreen = useCallback(() => {
    if (isActiveSessionLogin) {
      dispatch(setFinishedActiveSessionLoginFlow());
      navigation.popToTop();
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

  return {
    navigateToAuthenticationScreen,
    navigateToCieCardReaderScreen,
    navigateToCieConsentDataUsage
  };
};

export default useActiveSessionLoginNavigation;
