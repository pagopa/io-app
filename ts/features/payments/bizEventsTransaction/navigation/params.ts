import { PaymentsTransactionBizEventsDetailsScreenParams } from "../screens/PaymentsTransactionBizEventsDetailsScreen";
import { PaymentsTransactionBizEventsCartItemDetailsScreenParams } from "../screens/PaymentsTransactionBizEventsCartItemDetailsScreen";
import { PaymentsTransactionBizEventsRoutes } from "./routes";

export type PaymentsTransactionBizEventsParamsList = {
  [PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_NAVIGATOR]: undefined;
  [PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_DETAILS]: PaymentsTransactionBizEventsDetailsScreenParams;
  [PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_CART_ITEM_DETAILS]: PaymentsTransactionBizEventsCartItemDetailsScreenParams;
  [PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_LIST_SCREEN]: undefined;
  [PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_PREVIEW_SCREEN]: undefined;
};
