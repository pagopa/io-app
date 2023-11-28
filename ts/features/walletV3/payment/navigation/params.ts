import { WalletPaymentDetailScreenNavigationParams } from "../screens/WalletPaymentDetailScreen";
import { WalletPaymentInputFiscalCodeScreenNavigationParams } from "../screens/WalletPaymentInputFiscalCodeScreen";
import { WalletPaymentOutcomeScreenNavigationParams } from "../screens/WalletPaymentOutcomeScreen";
import { WalletPaymentPspListScreenNavigationParams } from "../screens/WalletPaymentPspListScreen";
import { WalletPaymentRoutes } from "./routes";

export type WalletPaymentParamsList = {
  [WalletPaymentRoutes.WALLET_PAYMENT_MAIN]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_INPUT_NOTICE_NUMBER]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_INPUT_FISCAL_CODE]: WalletPaymentInputFiscalCodeScreenNavigationParams;
  [WalletPaymentRoutes.WALLET_PAYMENT_DETAIL]: WalletPaymentDetailScreenNavigationParams;
  [WalletPaymentRoutes.WALLET_PAYMENT_METHOD_LIST]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_PSP_LIST]: WalletPaymentPspListScreenNavigationParams;
  [WalletPaymentRoutes.WALLET_PAYMENT_REVIEW]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_OUTCOME]: WalletPaymentOutcomeScreenNavigationParams;
};
