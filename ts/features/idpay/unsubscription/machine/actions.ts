import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { IdPayUnsubscriptionRoutes } from "../navigation/routes";

const createActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>
) => {
  const navigateToConfirmationScreen = () => {
    navigation.navigate(
      IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_NAVIGATOR,
      {
        screen: IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION
      }
    );
  };

  const navigateToResultScreen = () =>
    navigation.navigate(
      IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_NAVIGATOR,
      {
        screen: IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_RESULT
      }
    );

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
    navigateToConfirmationScreen,
    navigateToResultScreen,
    exitUnsubscription,
    exitToWallet
  };
};

export { createActionsImplementation };
