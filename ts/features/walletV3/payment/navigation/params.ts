import { WalletPaymentInputFiscalCodeScreenRouteParams } from "../screens/WalletPaymentInputFiscalCodeScreen";
import { WalletPaymentRoutes } from "./routes";

export type WalletPaymentParamsList = {
  [WalletPaymentRoutes.WALLET_PAYMENT_MAIN]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_INPUT_NOTICE_NUMBER]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_INPUT_FISCAL_CODE]: WalletPaymentInputFiscalCodeScreenRouteParams;
  [WalletPaymentRoutes.WALLET_PAYMENT_DETAIL]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_METHOD_LIST]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_PSP_LIST]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_REVIEW]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_PROCESS]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_OUTCOME]: undefined;
};
