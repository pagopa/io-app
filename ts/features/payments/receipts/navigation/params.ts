import { ReceiptCartItemDetailsScreenParams } from "../screens/ReceiptCartItemDetailsScreen";
import { ReceiptDetailsScreenParams } from "../screens/ReceiptDetailsScreen";
import { PaymentsReceiptRoutes } from "./routes";

export type PaymentsReceiptParamsList = {
  [PaymentsReceiptRoutes.PAYMENT_RECEIPT_NAVIGATOR]: undefined;
  [PaymentsReceiptRoutes.PAYMENT_RECEIPT_DETAILS]: ReceiptDetailsScreenParams;
  [PaymentsReceiptRoutes.PAYMENT_RECEIPT_CART_ITEM_DETAILS]: ReceiptCartItemDetailsScreenParams;
  [PaymentsReceiptRoutes.PAYMENT_RECEIPT_LIST_SCREEN]: undefined;
  [PaymentsReceiptRoutes.PAYMENT_RECEIPT_PREVIEW_SCREEN]: undefined;
  [PaymentsReceiptRoutes.PAYMENT_RECEIPT_LOADING_SCREEN]: undefined;
};
