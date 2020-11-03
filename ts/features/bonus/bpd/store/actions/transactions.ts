import { ActionType, createAsyncAction } from "typesafe-actions";
import { HPan } from "./paymentMethods";
import { AwardPeriodId, WithAwardPeriodId } from "./periods";

// TODO: placeholder, TBD how to map the circuit Type
export type CircuitType = "PagoBancomat" | "Visa" | "Mastercard";

/**
 * The single transaction acquired in a cashback period
 */
export type BpdTransaction = WithAwardPeriodId & {
  // The hashPan of the payment method used for the transaction
  hashPan: HPan;
  // id acquirer
  idTrxAcquirer: string;
  // id issuer
  idTrxIssuer: string;
  // total amount of the transaction, if negative the operation has been canceled
  amount: number;
  trxDate: Date;
  // cashback received from the transaction, if negative the operation has been canceled and also the cashback
  cashback: number;
  circuitType: CircuitType;
};

export type BpdTransactions = WithAwardPeriodId & {
  results: ReadonlyArray<BpdTransaction>;
};

type BpdTransactionsError = WithAwardPeriodId & {
  error: Error;
};

/**
 * Request all the transactions for a specific period
 */
export const bpdTransactionsLoad = createAsyncAction(
  "BPD_TRANSACTIONS_REQUEST",
  "BPD_TRANSACTIONS_SUCCESS",
  "BPD_TRANSACTIONS_FAILURE"
)<AwardPeriodId, BpdTransactions, BpdTransactionsError>();

export type BpdTransactionsAction = ActionType<typeof bpdTransactionsLoad>;
