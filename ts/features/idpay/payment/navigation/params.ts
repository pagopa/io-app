import { IDPayPaymentAuthorizationScreenRouteParams } from "../screens/IDPayPaymentAuthorizationScreen";
import { IdPayPaymentRoutes } from "./routes";

export type IdPayPaymentParamsList = {
  [IdPayPaymentRoutes.IDPAY_PAYMENT_MAIN]: undefined;
  [IdPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT]: undefined;
  [IdPayPaymentRoutes.IDPAY_PAYMENT_AUTHORIZATION]: IDPayPaymentAuthorizationScreenRouteParams;
  [IdPayPaymentRoutes.IDPAY_PAYMENT_RESULT]: undefined;
};
