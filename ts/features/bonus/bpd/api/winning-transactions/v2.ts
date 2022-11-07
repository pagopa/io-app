import * as r from "@pagopa/ts-commons/lib/requests";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import {
  findWinningTransactionsUsingGETDecoder,
  getCountByDayGETDefaultDecoder,
  GetCountByDayGETT
} from "../../../../../../definitions/bpd/winning_transactions_v2/requestTypes";
import { bpdHeadersProducers } from "../common";
import { PatchedWinningTransactionPageResource } from "./patchedWinningTransactionPageResource";

export const winningTransactionsV2CountByDayGET: GetCountByDayGETT = {
  method: "get",
  url: ({ awardPeriodId }) =>
    `/bpd/io/winning-transactions/v2/countbyday?awardPeriodId=${awardPeriodId}`,
  query: _ => ({}),
  headers: bpdHeadersProducers(),
  response_decoder: getCountByDayGETDefaultDecoder()
};

/**
 * We need to use a patched type because the response contains a date-time translated with the codec UTCISODateFromString
 * that fails to recognize the received format (used instead {@link DateFromISOString})
 */
export type PatchedFindWinningTransactionsUsingGETT = r.IGetApiRequestType<
  {
    readonly hpan?: string;
    readonly awardPeriodId: number;
    readonly limit?: number;
    readonly nextCursor?: number;
    readonly Authorization: string;
  },
  never,
  never,
  | r.IResponseType<200, PatchedWinningTransactionPageResource>
  | r.IResponseType<401, undefined>
  | r.IResponseType<500, undefined>
>;

const cursorToQueryString = (cursor: number) => `&nextCursor=${cursor}`;

const findWinningTransactionsUsingGETCustomDecoder =
  findWinningTransactionsUsingGETDecoder({
    200: PatchedWinningTransactionPageResource
  });

export const winningTransactionsV2GET: PatchedFindWinningTransactionsUsingGETT =
  {
    method: "get",
    url: ({ awardPeriodId, nextCursor }) =>
      `/bpd/io/winning-transactions/v2?awardPeriodId=${awardPeriodId}${pipe(
        nextCursor,
        O.fromNullable,
        O.map(cursorToQueryString),
        O.getOrElse(() => "")
      )}`,
    query: _ => ({}),
    headers: bpdHeadersProducers(),
    response_decoder: findWinningTransactionsUsingGETCustomDecoder
  };
