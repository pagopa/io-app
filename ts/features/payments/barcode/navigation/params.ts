import { PaymentsBarcodeChoiceScreenParams } from "../screens/PaymentsBarcodeChoiceScreen";
import { PaymentsBarcodeRoutes } from "./routes";

export type PaymentsBarcodeParamsList = {
  [PaymentsBarcodeRoutes.PAYMENT_BARCODE_NAVIGATOR]: undefined;
  [PaymentsBarcodeRoutes.PAYMENT_BARCODE_SCAN]: undefined;
  [PaymentsBarcodeRoutes.PAYMENT_BARCODE_CHOICE]: PaymentsBarcodeChoiceScreenParams;
};
