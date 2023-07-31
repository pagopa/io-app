import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { showToast } from "../../../../utils/showToast";
import { IDPayDetailsRoutes } from "../../initiative/details/navigation";
import { IDPayPaymentRoutes } from "../navigation/navigator";
import { Context } from "./context";

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
