import * as t from "io-ts";
import { DateFromString } from "@pagopa/ts-commons/lib/dates";
import { DateFromISOString } from "../../../../../utils/dates";

/**
 * We need to use a patched type because the response contains a date-time translated with the codec UTCISODateFromString
 * that fails to recognize the received format (used instead {@link DateFromISOString})
 */

// required attributes
const WinningTransactionMilestoneResourceR = t.interface({
  amount: t.number,

  awardPeriodId: t.Integer,

  cashback: t.number,

  circuitType: t.string,

  hashPan: t.string,

  idTrx: t.string,

  idTrxAcquirer: t.string,

  idTrxIssuer: t.string,
  // replaced from UTCISODateFromString
  trxDate: DateFromISOString
});

// optional attributes
const WinningTransactionMilestoneResourceO = t.partial({});

export const PatchedWinningTransactionMilestoneResource = t.intersection(
  [WinningTransactionMilestoneResourceR, WinningTransactionMilestoneResourceO],
  "PatchedWinningTransactionMilestoneResource"
);

export type PatchedWinningTransactionMilestoneResource = t.TypeOf<
  typeof PatchedWinningTransactionMilestoneResource
>;

// required attributes
const WinningTransactionsOfTheDayResourceR = t.interface({
  date: DateFromString,

  transactions: t.readonlyArray(
    PatchedWinningTransactionMilestoneResource,
    "array of WinningTransactionMilestoneResource"
  )
});

// optional attributes
const WinningTransactionsOfTheDayResourceO = t.partial({});

export const PatchedWinningTransactionsOfTheDayResource = t.intersection(
  [WinningTransactionsOfTheDayResourceR, WinningTransactionsOfTheDayResourceO],
  "PatchedWinningTransactionsOfTheDayResource"
);

export type PatchedWinningTransactionsOfTheDayResource = t.TypeOf<
  typeof PatchedWinningTransactionsOfTheDayResource
>;

const WinningTransactionPageResourceR = t.interface({
  transactions: t.readonlyArray(
    PatchedWinningTransactionsOfTheDayResource,
    "array of WinningTransactionsOfTheDayResource"
  )
});

// optional attributes
const WinningTransactionPageResourceO = t.partial({
  nextCursor: t.Integer,

  prevCursor: t.Integer
});

export const PatchedWinningTransactionPageResource = t.intersection(
  [WinningTransactionPageResourceR, WinningTransactionPageResourceO],
  "PatchedWinningTransactionPageResource"
);

export type PatchedWinningTransactionPageResource = t.TypeOf<
  typeof PatchedWinningTransactionPageResource
>;
