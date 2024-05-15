import { PaymentsTransactionBizEventsDetailsScreenParams } from "../screens/PaymentsTransactionBizEventsDetailsScreen";
import { PaymentsTransactionBizEventsOperationDetailsScreenParams } from "../screens/PaymentsTransactionBizEventsOperationDetails";
import { PaymentsTransactionBizEventsRoutes } from "./routes";

export type PaymentsTransactionBizEventsParamsList = {
  [PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_NAVIGATOR]: undefined;
  [PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_DETAILS]: PaymentsTransactionBizEventsDetailsScreenParams;
  [PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_OPERATION_DETAILS]: PaymentsTransactionBizEventsOperationDetailsScreenParams;
  [PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_LIST_SCREEN]: undefined;
};
