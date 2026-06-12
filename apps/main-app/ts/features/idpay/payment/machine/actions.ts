import { IOToast } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { IdPayPaymentRoutes } from "../navigation/routes";

export const createActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>
) => {
  const navigateToAuthorizationScreen = () => {
    navigation.navigate(IdPayPaymentRoutes.IDPAY_PAYMENT_MAIN, {
      screen: IdPayPaymentRoutes.IDPAY_PAYMENT_AUTHORIZATION,
      params: {}
    });
  };

  const navigateToResultScreen = () =>
    navigation.navigate(IdPayPaymentRoutes.IDPAY_PAYMENT_MAIN, {
      screen: IdPayPaymentRoutes.IDPAY_PAYMENT_RESULT
    });

  const showErrorToast = () =>
    IOToast.error(I18n.t("idpay.payment.authorization.error"));

  const closeAuthorization = () => {
    navigation.pop();
    navigation.pop();
  };

  return {
    navigateToAuthorizationScreen,
    navigateToResultScreen,
    showErrorToast,
    closeAuthorization
  };
};
