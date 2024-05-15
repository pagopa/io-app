import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { Transaction } from "../../../../../types/pagopa";

export const getPaymentsTransactionDetailsAction = createAsyncAction(
  "PAYMENTS_TRANSACTION_DETAILS_REQUEST",
  "PAYMENTS_TRANSACTION_DETAILS_SUCCESS",
  "PAYMENTS_TRANSACTION_DETAILS_FAILURE",
  "PAYMENTS_TRANSACTION_DETAILS_CANCEL"
)<{ transactionId: number }, Transaction, NetworkError, void>();

export type PaymentsTransactionActions = ActionType<
  typeof getPaymentsTransactionDetailsAction
>;
