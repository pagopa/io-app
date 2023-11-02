import { WalletPaymentBarcodeChoiceScreenParams } from "../screens/WalletPaymentBarcodeChoiceScreen";
import { WalletPaymentInputFiscalCodeScreenRouteParams } from "../screens/WalletPaymentInputFiscalCodeScreen";
import { WalletPaymentRoutes } from "./routes";

export type WalletPaymentParamsList = {
  [WalletPaymentRoutes.WALLET_PAYMENT_MAIN]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_BARCODE_SCAN]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_BARCODE_CHOICE]: WalletPaymentBarcodeChoiceScreenParams;
  [WalletPaymentRoutes.WALLET_PAYMENT_INPUT_NOTICE_NUMBER]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_INPUT_FISCAL_CODE]: WalletPaymentInputFiscalCodeScreenRouteParams;
};
