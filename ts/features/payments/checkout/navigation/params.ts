import { WalletPaymentDetailScreenNavigationParams } from "../screens/WalletPaymentDetailScreen";
import { WalletPaymentInputFiscalCodeScreenNavigationParams } from "../screens/WalletPaymentInputFiscalCodeScreen";
import { WalletPaymentOutcomeScreenNavigationParams } from "../screens/WalletPaymentOutcomeScreen";
import { PaymentsCheckoutRoutes } from "./routes";

export type PaymentsCheckoutParamsList = {
  [PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR]: undefined;
  [PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_INPUT_NOTICE_NUMBER]: undefined;
  [PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_INPUT_FISCAL_CODE]: WalletPaymentInputFiscalCodeScreenNavigationParams;
  [PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_DETAIL]: WalletPaymentDetailScreenNavigationParams;
  [PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_MAKE]: undefined;
  [PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_OUTCOME]: WalletPaymentOutcomeScreenNavigationParams;
};
