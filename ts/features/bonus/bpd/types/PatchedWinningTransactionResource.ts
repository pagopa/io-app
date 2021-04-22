import * as t from "io-ts";
import { DateFromISOString } from "../../../../utils/dates";

/**
 * Patched version of bpd/winning_transactions/WinningTransactionResource
 * - trxDate uses DateFromISOStringType instead of UTCISODateFromString (can't decode datetime with offset, ex 2020-10-23T11:13:07.442+02:00)
 */

// required attributes
const PatchedWinningTransactionResourceR = t.interface({
  amount: t.number,

  awardPeriodId: t.Integer,

  cashback: t.number,

  circuitType: t.string,

  hashPan: t.string,

  idTrxAcquirer: t.string,

  idTrxIssuer: t.string,

  trxDate: DateFromISOString
});

// optional attributes
const PatchedWinningTransactionResourceO = t.partial({});

export const PatchedWinningTransactionResource = t.intersection(
  [PatchedWinningTransactionResourceR, PatchedWinningTransactionResourceO],
  "PatchedWinningTransactionResource"
);

export type PatchedWinningTransactionResource = t.TypeOf<
  typeof PatchedWinningTransactionResource
>;

export const PatchedBpdWinningTransactions = t.readonlyArray(
  PatchedWinningTransactionResource
);

export type PatchedBpdWinningTransactions = t.TypeOf<
  typeof PatchedBpdWinningTransactions
>;
