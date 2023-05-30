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
      screen: IDPayPaymentRoutes.IDPAY_PAYMENT_AUTHORIZATION
    });
  };

  const navigateToResultScreen = () =>
    navigation.replace(IDPayPaymentRoutes.IDPAY_PAYMENT_MAIN, {
      screen: IDPayPaymentRoutes.IDPAY_PAYMENT_RESULT
    });

  const navigateBack = () => {
    navigation.goBack();
  };

  const exitAuthorization = () => {
    navigation.pop();
  };

  return {
    navigateToAuthorizationScreen,
    navigateToResultScreen,
    navigateBack,
    exitAuthorization
  };
};

export { createActionsImplementation };
