import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { IDPayPaymentRoutes } from "../navigation/navigator";

const createActionsImplementation = (
  navigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>
) => {
  const navigateToAuthorizationScreen = () => {
    navigation.navigate(IDPayPaymentRoutes.IDPAY_PAYMENT_MAIN, {
      screen: IDPayPaymentRoutes.IDPAY_PAYMENT_AUTHORIZATION,
      params: {}
    });
  };

  const navigateToResultScreen = () =>
    navigation.navigate(IDPayPaymentRoutes.IDPAY_PAYMENT_MAIN, {
      screen: IDPayPaymentRoutes.IDPAY_PAYMENT_RESULT
    });

  const exitAuthorization = () => {
    navigation.pop();
  };

  return {
    navigateToAuthorizationScreen,
    navigateToResultScreen,
    exitAuthorization
  };
};

export { createActionsImplementation };
