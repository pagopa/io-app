/* eslint-disable arrow-body-style */

import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { IDPayUnsubscriptionRoutes } from "../navigation/navigator";
import { Context } from "./context";

const createActionsImplementation = (
  navigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>
) => {
  const navigateToConfirmationScreen = (context: Context) =>
    navigation.navigate(IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
      screen: IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION,
      params: {
        initiativeId: context.initiativeId,
        initiativeName: context.initiativeName
      }
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
