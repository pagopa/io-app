import { WalletPaymentDetailScreenNavigationParams } from "../screens/WalletPaymentDetailScreen";
import { WalletPaymentInputFiscalCodeScreenNavigationParams } from "../screens/WalletPaymentInputFiscalCodeScreen";
import { WalletPaymentOutcomeScreenNavigationParams } from "../screens/WalletPaymentOutcomeScreen";
import { WalletPaymentRoutes } from "./routes";

export type WalletPaymentParamsList = {
  [WalletPaymentRoutes.WALLET_PAYMENT_MAIN]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_INPUT_NOTICE_NUMBER]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_INPUT_FISCAL_CODE]: WalletPaymentInputFiscalCodeScreenNavigationParams;
  [WalletPaymentRoutes.WALLET_PAYMENT_DETAIL]: WalletPaymentDetailScreenNavigationParams;
  [WalletPaymentRoutes.WALLET_PAYMENT_PICK_METHOD]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_PICK_PSP]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_CONFIRM]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_OUTCOME]: WalletPaymentOutcomeScreenNavigationParams;
};
