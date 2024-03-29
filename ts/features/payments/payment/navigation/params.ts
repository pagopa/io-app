import { WalletPaymentDetailScreenNavigationParams } from "../screens/WalletPaymentDetailScreen";
import { WalletPaymentInputFiscalCodeScreenNavigationParams } from "../screens/WalletPaymentInputFiscalCodeScreen";
import { WalletPaymentOutcomeScreenNavigationParams } from "../screens/WalletPaymentOutcomeScreen";
import { PaymentsPaymentRoutes } from "./routes";

export type PaymentsPaymentParamsList = {
  [PaymentsPaymentRoutes.PAYMENTS_PAYMENT_NAVIGATOR]: undefined;
  [PaymentsPaymentRoutes.PAYMENTS_PAYMENT_INPUT_NOTICE_NUMBER]: undefined;
  [PaymentsPaymentRoutes.PAYMENTS_PAYMENT_INPUT_FISCAL_CODE]: WalletPaymentInputFiscalCodeScreenNavigationParams;
  [PaymentsPaymentRoutes.PAYMENTS_PAYMENT_DETAIL]: WalletPaymentDetailScreenNavigationParams;
  [PaymentsPaymentRoutes.PAYMENTS_PAYMENT_MAKE]: undefined;
  [PaymentsPaymentRoutes.PAYMENTS_PAYMENT_OUTCOME]: WalletPaymentOutcomeScreenNavigationParams;
};
