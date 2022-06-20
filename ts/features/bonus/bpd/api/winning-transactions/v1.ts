/* TOTAL CASHBACK  */
import * as O from "fp-ts/lib/Option";
import * as r from "@pagopa/ts-commons/lib/requests";
import { pipe } from "fp-ts/lib/function";
import {
  findWinningTransactionsUsingGETDecoder,
  getTotalScoreUsingGETDefaultDecoder,
  GetTotalScoreUsingGETT
} from "../../../../../../definitions/bpd/winning_transactions/requestTypes";
import { PatchedBpdWinningTransactions } from "../../types/PatchedWinningTransactionResource";
import { bpdHeadersProducers } from "../common";

export const winningTransactionsTotalCashbackGET: GetTotalScoreUsingGETT = {
  method: "get",
  url: ({ awardPeriodId }) =>
    `/bpd/io/winning-transactions/total-cashback?awardPeriodId=${awardPeriodId}`,
  query: _ => ({}),
  headers: bpdHeadersProducers(),
  response_decoder: getTotalScoreUsingGETDefaultDecoder()
};

export type FindWinningTransactionsUsingGETTExtra = r.IGetApiRequestType<
  {
    readonly awardPeriodId: number;
    readonly hpan: string;
    readonly Authorization: string;
  },
  never,
  never,
  | r.IResponseType<200, PatchedBpdWinningTransactions>
  | r.IResponseType<401, undefined>
  | r.IResponseType<500, undefined>
>;

const hPanToQueryString = (hPan: string) => `&hpan=${hPan}`;

const findWinningTransactionsUsingGETCustomDecoder =
  findWinningTransactionsUsingGETDecoder({
    200: PatchedBpdWinningTransactions
  });
/**
 * @deprecated
 */
export const winningTransactionsGET: FindWinningTransactionsUsingGETTExtra = {
  method: "get",
  url: ({ awardPeriodId, hpan }) =>
    `/bpd/io/winning-transactions?awardPeriodId=${awardPeriodId}${pipe(
      hpan,
      O.fromNullable,
      O.map(hPanToQueryString),
      O.getOrElse(() => "")
    )}`,
  query: _ => ({}),
  headers: bpdHeadersProducers(),
  response_decoder: findWinningTransactionsUsingGETCustomDecoder
};
