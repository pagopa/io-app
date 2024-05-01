import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { showToast } from "../../../../utils/showToast";
import { IDPayDetailsRoutes } from "../../details/navigation";
import { IdPayPaymentRoutes } from "../navigation/routes";
import { Context } from "./context";

const createActionsImplementation = (
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
    showToast(I18n.t("idpay.payment.authorization.error"), "danger", "top");

  const exitAuthorization = (context: Context) => {
    pipe(
      context.transactionData,
      O.map(({ initiativeId }) => {
        navigation.popToTop();
        navigation.navigate(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
          screen: IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING,
          params: { initiativeId }
        });
      }),
      O.getOrElse(() => navigation.pop())
    );
  };

  return {
    navigateToAuthorizationScreen,
    navigateToResultScreen,
    showErrorToast,
    exitAuthorization
  };
};

export { createActionsImplementation };
