import { PaymentsTransactionDetailsScreenParams } from "../screens/PaymentsTransactionDetailsScreen";
import { PaymentsTransactionOperationDetailsScreenParams } from "../screens/PaymentsTransactionOperationDetails";
import { PaymentsTransactionRoutes } from "./routes";

export type PaymentsTransactionParamsList = {
  [PaymentsTransactionRoutes.PAYMENTS_TRANSACTION_NAVIGATOR]: undefined;
  [PaymentsTransactionRoutes.PAYMENTS_TRANSACTION_DETAILS]: PaymentsTransactionDetailsScreenParams;
  [PaymentsTransactionRoutes.PAYMENTS_TRANSACTION_OPERATION_DETAILS]: PaymentsTransactionOperationDetailsScreenParams;
};
