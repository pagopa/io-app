import {
  getCountByDayGETDefaultDecoder,
  GetCountByDayGETT
} from "../../../../../../definitions/bpd/winning_transactions_v2/requestTypes";
import { bpdHeadersProducers } from "../common";

export const winningTransactionsV2: GetCountByDayGETT = {
  method: "get",
  url: ({ awardPeriodId }) =>
    `/bpd/io/winning-transactions/v2/countbyday?awardPeriodId=${awardPeriodId}`,
  query: _ => ({}),
  headers: bpdHeadersProducers(),
  response_decoder: getCountByDayGETDefaultDecoder()
};
