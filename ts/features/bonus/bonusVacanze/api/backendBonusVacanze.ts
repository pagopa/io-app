import {
  createFetchRequestForApi,
  RequestHeaderProducer,
  RequestHeaders
} from "@pagopa/ts-commons/lib/requests";
import { Omit } from "@pagopa/ts-commons/lib/types";
import {
  getAllBonusActivationsDefaultDecoder,
  GetAllBonusActivationsT,
  getLatestBonusActivationByIdDefaultDecoder,
  GetLatestBonusActivationByIdT
} from "../../../../../definitions/bonus_vacanze/requestTypes";
import { defaultRetryingFetch } from "../../../../utils/fetch";

const tokenHeaderProducer = ParamAuthorizationBearerHeaderProducer();

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

function ParamAuthorizationBearerHeaderProducer<
  P extends { readonly Bearer: string }
>(): RequestHeaderProducer<P, "Authorization"> {
  return (p: P): RequestHeaders<"Authorization"> => ({
    Authorization: `Bearer ${p.Bearer}`
  });
}

//
// A specific backend client to handle bonus vacanze requests
//
export function BackendBonusVacanze(
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
