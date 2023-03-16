import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { IDPayUnsubscriptionRoutes } from "../navigation/navigator";

const createActionsImplementation = (
  navigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>
) => {
  const navigateToConfirmationScreen = () => {
    navigation.navigate(IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
      screen: IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION
    });
  };

  const navigateToSuccessScreen = () =>
    navigation.navigate(IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
      screen: IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_SUCCESS
    });

  const navigateToFailureScreen = () =>
    navigation.navigate(IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
      screen: IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_FAILURE
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
    navigateToConfirmationScreen,
    navigateToFailureScreen,
    navigateToSuccessScreen,
    exitUnsubscription,
    exitToWallet
  };
};

export { createActionsImplementation };
