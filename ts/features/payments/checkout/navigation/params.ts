import { WalletPaymentDetailScreenNavigationParams } from "../screens/WalletPaymentDetailScreen";
import { WalletPaymentInputFiscalCodeScreenNavigationParams } from "../screens/WalletPaymentInputFiscalCodeScreen";
import { WalletPaymentOutcomeScreenNavigationParams } from "../screens/WalletPaymentOutcomeScreen";
import { PaymentsCheckoutRoutes } from "./routes";

export type PaymentsCheckoutParamsList = {
  [PaymentsCheckoutRoutes.PAYMENTS_CHECKOUT_NAVIGATOR]: undefined;
  [PaymentsCheckoutRoutes.PAYMENTS_CHECKOUT_INPUT_NOTICE_NUMBER]: undefined;
  [PaymentsCheckoutRoutes.PAYMENTS_CHECKOUT_INPUT_FISCAL_CODE]: WalletPaymentInputFiscalCodeScreenNavigationParams;
  [PaymentsCheckoutRoutes.PAYMENTS_CHECKOUT_DETAIL]: WalletPaymentDetailScreenNavigationParams;
  [PaymentsCheckoutRoutes.PAYMENTS_CHECKOUT_MAKE]: undefined;
  [PaymentsCheckoutRoutes.PAYMENTS_CHECKOUT_OUTCOME]: WalletPaymentOutcomeScreenNavigationParams;
};
