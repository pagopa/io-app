import {
  basicResponseDecoder,
  BasicResponseType,
  createFetchRequestForApi,
  IGetApiRequestType
} from "italia-ts-commons/lib/requests";

import { defaultRetryingFetch } from "../../../utils/fetch";
import { BonusList, BonusListT } from "../types/bonusList";

type GetBonusListT = IGetApiRequestType<
  {},
  never,
  never,
  BasicResponseType<BonusList>
>;

//
// A specific backend client to handle bonus vacanze requests
//
export function BackendBonusVacanze(
  baseUrl: string,
  fetchApi: typeof fetch = defaultRetryingFetch()
) {
  const options = {
    baseUrl,
    fetchApi
  };

  const getAvailableBonusesT: GetBonusListT = {
    method: "get",
    url: () => `/bonus`,
    query: _ => ({}),
    headers: () => ({}),
    response_decoder: basicResponseDecoder(BonusListT)
  };

  return {
    getAvailableBonuses: createFetchRequestForApi(getAvailableBonusesT, options)
  };
}
