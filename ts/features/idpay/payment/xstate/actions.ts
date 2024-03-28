import { IOToast } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { refreshSessionToken } from "../../../fastLogin/store/actions/tokenRefreshActions";
import { IDPayDetailsRoutes } from "../../details/navigation";
import { IDPayPaymentRoutes } from "../navigation/navigator";
import { Context } from "./context";

const createActionsImplementation = (
  navigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>,
  dispatch: ReturnType<typeof useIODispatch>
) => {
  const handleSessionExpired = () => {
    dispatch(
      refreshSessionToken.request({
        withUserInteraction: true,
        showIdentificationModalAtStartup: false,
        showLoader: true
      })
    );
  };

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
    IOToast.error(I18n.t("idpay.payment.authorization.error"));

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
    handleSessionExpired,
    navigateToAuthorizationScreen,
    navigateToResultScreen,
    showErrorToast,
    exitAuthorization
  };
};

export { createActionsImplementation };
