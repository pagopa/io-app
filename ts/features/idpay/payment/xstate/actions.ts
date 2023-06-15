import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { showToast } from "../../../../utils/showToast";
import { IDPayPaymentRoutes } from "../navigation/navigator";
import { Context } from "./context";
import { PaymentFailureEnum } from "./failure";

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

  const showErrorToast = (ctx: Context) =>
    pipe(
      ctx.failure,
      O.filter(failure => failure === PaymentFailureEnum.TOO_MANY_REQUESTS),
      O.map(() =>
        showToast(I18n.t("idpay.payment.authorization.error"), "danger", "top")
      )
    );

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
