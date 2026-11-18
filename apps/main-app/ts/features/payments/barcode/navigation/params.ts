import { PaymentsBarcodeChoiceScreenParams } from "../screens/PaymentsBarcodeChoiceScreen";
import { IncomingShare } from "../utils/incomingShare";
import { PaymentsBarcodeRoutes } from "./routes";

export type PaymentsBarcodeParamsList = {
  [PaymentsBarcodeRoutes.PAYMENT_BARCODE_CHOICE]: PaymentsBarcodeChoiceScreenParams;
  [PaymentsBarcodeRoutes.PAYMENT_BARCODE_NAVIGATOR]: undefined;
  [PaymentsBarcodeRoutes.PAYMENT_BARCODE_SCAN]:
    | undefined
    | { sharedFile: IncomingShare };
};
