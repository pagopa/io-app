import { WalletBarcodeChoiceScreenParams } from "../screens/WalletBarcodeChoiceScreen";
import { WalletBarcodeRoutes } from "./routes";

export type WalletBarcodeParamsList = {
  [WalletBarcodeRoutes.WALLET_BARCODE_MAIN]: undefined;
  [WalletBarcodeRoutes.WALLET_BARCODE_SCAN]: undefined;
  [WalletBarcodeRoutes.WALLET_BARCODE_CHOICE]: WalletBarcodeChoiceScreenParams;
};
