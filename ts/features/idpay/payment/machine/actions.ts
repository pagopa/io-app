import { useIOToast } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { IdPayPaymentRoutes } from "../navigation/routes";

export const useActionsImplementation = () => {
  const navigation = useIONavigation();
  const toast = useIOToast();

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
    toast.error(I18n.t("idpay.payment.authorization.error"));

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
