import { fromNullable } from "fp-ts/lib/Option";
import {
  findWinningTransactionsUsingGETDefaultDecoder,
  FindWinningTransactionsUsingGETT,
  getCountByDayGETDefaultDecoder,
  GetCountByDayGETT
} from "../../../../../../definitions/bpd/winning_transactions_v2/requestTypes";
import { bpdHeadersProducers } from "../common";

export const winningTransactionsV2CountByDayGET: GetCountByDayGETT = {
  method: "get",
  url: ({ awardPeriodId }) =>
    `/bpd/io/winning-transactions/v2/countbyday?awardPeriodId=${awardPeriodId}`,
  query: _ => ({}),
  headers: bpdHeadersProducers(),
  response_decoder: getCountByDayGETDefaultDecoder()
};

export const winningTransactionsV2GET: FindWinningTransactionsUsingGETT = {
  method: "get",
  url: ({ awardPeriodId, nextCursor }) =>
    `/bpd/io/winning-transactions/v2?awardPeriodId=${awardPeriodId}${fromNullable(
      nextCursor
    )
      .map(c => `&nextCursor=${c}`)
      .getOrElse("")}`,
  query: _ => ({}),
  headers: bpdHeadersProducers(),
  response_decoder: findWinningTransactionsUsingGETDefaultDecoder()
};
