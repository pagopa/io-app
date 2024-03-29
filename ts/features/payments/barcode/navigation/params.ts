import { PaymentsBarcodeChoiceScreenParams } from "../screens/PaymentsBarcodeChoiceScreen";
import { PaymentsBarcodeRoutes } from "./routes";

export type PaymentsBarcodeParamsList = {
  [PaymentsBarcodeRoutes.PAYMENTS_BARCODE_NAVIGATOR]: undefined;
  [PaymentsBarcodeRoutes.PAYMENTS_BARCODE_SCAN]: undefined;
  [PaymentsBarcodeRoutes.PAYMENTS_BARCODE_CHOICE]: PaymentsBarcodeChoiceScreenParams;
};
