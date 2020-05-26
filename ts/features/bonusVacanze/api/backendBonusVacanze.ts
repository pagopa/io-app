import * as t from "io-ts";
import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";
import {
  basicResponseDecoder,
  BasicResponseType,
  createFetchRequestForApi,
  IGetApiRequestType
} from "italia-ts-commons/lib/requests";
import { Timestamp } from "../../../../definitions/backend/Timestamp";
import { defaultRetryingFetch } from "../../../utils/fetch";

// bonus list

const BonusItemR = t.interface({
  id: NonNegativeInteger,
  name: t.string,
  description: t.string,
  valid_from: Timestamp,
  valid_to: Timestamp
});
const BonusItemO = t.partial({
  cover: t.string
});
export const BonusItem = t.intersection([BonusItemR, BonusItemO], "BonusItem");
const BonusListR = t.interface({
  items: t.readonlyArray(BonusItem, "array of Bonus")
});
const BonusListRO = t.partial({});
const BonusList = t.intersection([BonusListR, BonusListRO], "BonusList");
export type BonusList = t.TypeOf<typeof BonusList>;

type GetBonusListT = IGetApiRequestType<
  {},
  never,
  never,
  BasicResponseType<BonusList>
>;
//
// Create client
//
export function BackendBonusVacanze(
  baseUrl: string,
  fetchApi: typeof fetch = defaultRetryingFetch()
) {
  const options = {
    baseUrl,
    fetchApi
  };

  const getBonusListT: GetBonusListT = {
    method: "get",
    url: () => `/bonus`,
    query: _ => ({}),
    headers: () => ({}),
    response_decoder: basicResponseDecoder(BonusList)
  };

  return {
    getBonusList: createFetchRequestForApi(getBonusListT, options)
  };
}
