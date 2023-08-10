import { WalletPaymentBarcodeChoiceScreenParams } from "../screens/WalletPaymentBarcodeChoiceScreen";
import { WalletPaymentRoutes } from "./routes";

export type WalletPaymentParamsList = {
  [WalletPaymentRoutes.WALLET_PAYMENT_MAIN]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_BARCODE_SCAN]: undefined;
  [WalletPaymentRoutes.WALLET_PAYMENT_BARCODE_CHOICE]: WalletPaymentBarcodeChoiceScreenParams;
};
