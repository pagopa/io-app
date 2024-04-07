import { PaymentsTransactionDetailsScreenParams } from "../screens/PaymentsTransactionDetailsScreen";
import { PaymentsTransactionOperationDetailsScreenParams } from "../screens/PaymentsTransactionOperationDetails";
import { PaymentsTransactionRoutes } from "./routes";

export type PaymentsTransactionParamsList = {
  [PaymentsTransactionRoutes.PAYMENT_TRANSACTION_NAVIGATOR]: undefined;
  [PaymentsTransactionRoutes.PAYMENT_TRANSACTION_DETAILS]: PaymentsTransactionDetailsScreenParams;
  [PaymentsTransactionRoutes.PAYMENT_TRANSACTION_OPERATION_DETAILS]: PaymentsTransactionOperationDetailsScreenParams;
};
