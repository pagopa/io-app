import {
  ApiHeaderJson,
  composeHeaderProducers,
  createFetchRequestForApi,
  RequestHeaderProducer,
  RequestHeaders
} from "italia-ts-commons/lib/requests";
import { Omit } from "italia-ts-commons/lib/types";
import {
  getAllBonusActivationsDefaultDecoder,
  GetAllBonusActivationsT,
  getBonusEligibilityCheckDefaultDecoder,
  GetBonusEligibilityCheckT,
  getLatestBonusActivationByIdDefaultDecoder,
  GetLatestBonusActivationByIdT,
  startBonusActivationProcedureDefaultDecoder,
  StartBonusActivationProcedureT,
  startBonusEligibilityCheckDefaultDecoder,
  StartBonusEligibilityCheckT
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

const startBonusActivationProcedure: StartBonusActivationProcedureT = {
  method: "post",
  url: () => `/api/v1/bonus/vacanze/activations`,
  query: _ => ({}),
  body: _ => "",
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: startBonusActivationProcedureDefaultDecoder()
};

const startBonusEligibilityCheckT: StartBonusEligibilityCheckT = {
  method: "post",
  url: () => `/api/v1/bonus/vacanze/eligibility`,
  query: _ => ({}),
  body: _ => "",
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: startBonusEligibilityCheckDefaultDecoder()
};

const getBonusEligibilityCheckT: GetBonusEligibilityCheckT = {
  method: "get",
  url: () => `/api/v1/bonus/vacanze/eligibility`,
  query: _ => ({}),
  headers: tokenHeaderProducer,
  response_decoder: getBonusEligibilityCheckDefaultDecoder()
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
  const withBearerToken = <P extends { Bearer: string }, R>(
    f: (p: P) => Promise<R>
  ) => async (po: Omit<P, "Bearer">): Promise<R> => {
    const params = Object.assign({ Bearer: String(token) }, po) as P;
    return f(params);
  };

  return {
    startBonusEligibilityCheck: withBearerToken(
      createFetchRequestForApi(startBonusEligibilityCheckT, options)
    ),
    getBonusEligibilityCheck: withBearerToken(
      createFetchRequestForApi(getBonusEligibilityCheckT, options)
    ),
    getLatestBonusVacanzeFromId: withBearerToken(
      createFetchRequestForApi(getLatestBonusFromIdT, options)
    ),
    startBonusActivationProcedure: withBearerToken(
      createFetchRequestForApi(startBonusActivationProcedure, options)
    ),
    getAllBonusActivations: withBearerToken(
      createFetchRequestForApi(getAllBonusActivations, options)
    )
  };
}
