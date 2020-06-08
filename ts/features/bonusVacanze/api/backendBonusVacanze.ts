import {
  basicResponseDecoder,
  BasicResponseType,
  createFetchRequestForApi,
  IGetApiRequestType
} from "italia-ts-commons/lib/requests";
import {
  getBonusEligibilityCheckDefaultDecoder,
  GetBonusEligibilityCheckT,
  getLatestBonusActivationByIdDefaultDecoder,
  GetLatestBonusActivationByIdT,
  startBonusEligibilityCheckDefaultDecoder,
  StartBonusEligibilityCheckT
} from "../../../../definitions/bonus_vacanze/requestTypes";
import { defaultRetryingFetch } from "../../../utils/fetch";
import {
  BonusesAvailable,
  BonusesAvailableCodec
} from "../types/bonusesAvailable";

type GetBonusListT = IGetApiRequestType<
  {},
  never,
  never,
  BasicResponseType<BonusesAvailable>
>;

const getLatestBonusFromIdT: GetLatestBonusActivationByIdT = {
  method: "get",
  url: params => `/bonus/vacanze/activations/${params.bonus_id}`,
  query: _ => ({}),
  headers: () => ({}),
  response_decoder: getLatestBonusActivationByIdDefaultDecoder()
};

const startBonusEligibilityCheckT: StartBonusEligibilityCheckT = {
  method: "post",
  url: () => `/bonus/vacanze/eligibility`,
  query: _ => ({}),
  body: _ => "",
  headers: () => ({ "Content-Type": "application/json" }),
  response_decoder: startBonusEligibilityCheckDefaultDecoder()
};

const getBonusEligibilityCheckT: GetBonusEligibilityCheckT = {
  method: "get",
  url: () => `/bonus/vacanze/eligibility`,
  query: _ => ({}),
  headers: () => ({}),
  response_decoder: getBonusEligibilityCheckDefaultDecoder()
};

const getAvailableBonusesT: GetBonusListT = {
  method: "get",
  url: () => `/bonus/vacanze`,
  query: _ => ({}),
  headers: () => ({}),
  response_decoder: basicResponseDecoder(BonusesAvailableCodec)
};

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

  return {
    getAvailableBonuses: createFetchRequestForApi(
      getAvailableBonusesT,
      options
    ),
    startBonusEligibilityCheck: createFetchRequestForApi(
      startBonusEligibilityCheckT,
      options
    ),
    getBonusEligibilityCheck: createFetchRequestForApi(
      getBonusEligibilityCheckT,
      options
    ),
    getLatestBonusVacanzeFromId: createFetchRequestForApi(
      getLatestBonusFromIdT,
      options
    )
  };
}
