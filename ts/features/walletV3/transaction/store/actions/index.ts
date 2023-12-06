import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { Transaction } from "../../../../../types/pagopa";

export type WalletTransactionDetailsPayload = {
  transactionId: number;
};

export const walletTransactionDetailsGet = createAsyncAction(
  "WALLET_TRANSACTION_DETAILS_REQUEST",
  "WALLET_TRANSACTION_DETAILS_SUCCESS",
  "WALLET_TRANSACTION_DETAILS_FAILURE",
  "WALLET_TRANSACTION_DETAILS_CANCEL"
)<WalletTransactionDetailsPayload, Transaction, NetworkError, void>();

export type WalletTransactionActions = ActionType<
  typeof walletTransactionDetailsGet
>;
