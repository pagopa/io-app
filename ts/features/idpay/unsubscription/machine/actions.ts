import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIODispatch } from "../../../../store/hooks";
import { refreshSessionToken } from "../../../fastLogin/store/actions/tokenRefreshActions";
import { IDPayUnsubscriptionRoutes } from "../navigation/navigator";

const createActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>,
  dispatch: ReturnType<typeof useIODispatch>
) => {
  const handleSessionExpired = () => {
    dispatch(
      refreshSessionToken.request({
        withUserInteraction: true,
        showIdentificationModalAtStartup: false,
        showLoader: true
      })
    );
  };

  const navigateToConfirmationScreen = () => {
    navigation.navigate(IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
      screen: IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION
    });
  };

  const navigateToResultScreen = () =>
    navigation.navigate(IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
      screen: IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_RESULT
    });

  const exitUnsubscription = () => {
    navigation.pop();
  };

  const exitToWallet = () => {
    navigation.popToTop();
    navigation.navigate(ROUTES.MAIN, {
      screen: ROUTES.WALLET_HOME,
      params: { newMethodAdded: false }
    });
  };

  return {
    handleSessionExpired,
    navigateToConfirmationScreen,
    navigateToResultScreen,
    exitUnsubscription,
    exitToWallet
  };
};

export { createActionsImplementation };
