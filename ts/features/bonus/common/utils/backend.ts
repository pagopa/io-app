import { createFetchRequestForApi } from "@pagopa/ts-commons/lib/requests";
import { defaultRetryingFetch } from "../../../../utils/fetch";
import {
  GetAllBonusActivationsT,
  GetLatestBonusActivationByIdT,
  getAllBonusActivationsDefaultDecoder,
  getLatestBonusActivationByIdDefaultDecoder
} from "../../../../../definitions/bonus_vacanze/requestTypes";
import { tokenHeaderProducer } from "../../../../utils/api";

const getAllBonusActivations: GetAllBonusActivationsT = {
  method: "get",
  url: () => `/api/v1/bonus/vacanze/activations`,
  query: _ => ({}),
  headers: tokenHeaderProducer,
  response_decoder: getAllBonusActivationsDefaultDecoder()
};

const getLatestBonusFromIdT: GetLatestBonusActivationByIdT = {
  method: "get",
  url: params => `/api/v1/bonus/vacanze/activations/${params.bonus_id}`,
  query: _ => ({}),
  headers: tokenHeaderProducer,
  response_decoder: getLatestBonusActivationByIdDefaultDecoder()
};

export function BackendBonusGeneric(
  baseUrl: string,
  token: string,
  fetchApi: typeof fetch = defaultRetryingFetch()
) {
  const options = {
    baseUrl,
    fetchApi
  };

  // withBearerToken injects the field 'Baerer' with value token into the parameter P
  // of the f function
  const withBearerToken =
    <P extends { Bearer: string }, R>(f: (p: P) => Promise<R>) =>
    async (po: Omit<P, "Bearer">): Promise<R> => {
      const params = Object.assign({ Bearer: String(token) }, po) as P;
      return f(params);
    };

  return {
    getLatestBonusVacanzeFromId: withBearerToken(
      createFetchRequestForApi(getLatestBonusFromIdT, options)
    ),
    getAllBonusActivations: withBearerToken(
      createFetchRequestForApi(getAllBonusActivations, options)
    )
  };
}
