/* eslint-disable arrow-body-style */

import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { IDPayUnsubscriptionRoutes } from "../navigation/navigator";

const createActionsImplementation = (
  navigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>
) => {
  const navigateToConfirmationScreen = () =>
    navigation.navigate(IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
      screen: IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION
    });

  const navigateToSuccessScreen = () =>
    navigation.navigate(IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
      screen: IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_SUCCESS
    });

  const navigateToFailureScreen = () =>
    navigation.navigate(IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
      screen: IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_FAILURE
    });

  return {
    navigateToConfirmationScreen,
    navigateToFailureScreen,
    navigateToSuccessScreen
  };
};

export { createActionsImplementation };
