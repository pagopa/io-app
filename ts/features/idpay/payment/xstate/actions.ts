import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { showToast } from "../../../../utils/showToast";
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

  const showErrorToast = () =>
    showToast(I18n.t("idpay.payment.authorization.error"), "danger", "top");

  const exitAuthorization = () => {
    navigation.pop();
  };

  return {
    navigateToAuthorizationScreen,
    navigateToResultScreen,
    showErrorToast,
    exitAuthorization
  };
};

export { createActionsImplementation };
