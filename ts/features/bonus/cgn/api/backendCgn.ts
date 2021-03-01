import {
  ApiHeaderJson,
  composeHeaderProducers,
  createFetchRequestForApi,
  RequestHeaderProducer,
  RequestHeaders
} from "italia-ts-commons/lib/requests";
import { Omit } from "italia-ts-commons/lib/types";
import { defaultRetryingFetch } from "../../../../utils/fetch";
import {
  getCgnActivationDefaultDecoder,
  GetCgnActivationT,
  getCgnStatusDefaultDecoder,
  GetCgnStatusT,
  getEycaActivationDefaultDecoder,
  GetEycaActivationT,
  getEycaStatusDefaultDecoder,
  GetEycaStatusT,
  startCgnActivationDefaultDecoder,
  StartCgnActivationT,
  startEycaActivationDefaultDecoder,
  StartEycaActivationT
} from "../../../../../definitions/cgn/requestTypes";

const tokenHeaderProducer = ParamAuthorizationBearerHeaderProducer();

const BASE_URL = "/api/v1/cgn";

const startCgnActivation: StartCgnActivationT = {
  method: "post",
  url: () => `${BASE_URL}/activation`,
  query: _ => ({}),
  body: _ => "",
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: startCgnActivationDefaultDecoder()
};

const getCgnActivation: GetCgnActivationT = {
  method: "get",
  url: () => `${BASE_URL}/activation`,
  query: _ => ({}),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: getCgnActivationDefaultDecoder()
};

const getCgnStatus: GetCgnStatusT = {
  method: "get",
  url: () => `${BASE_URL}/status`,
  query: _ => ({}),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: getCgnStatusDefaultDecoder()
};

const startEycaActivation: StartEycaActivationT = {
  method: "post",
  url: () => `${BASE_URL}/eyca/activation`,
  query: _ => ({}),
  body: _ => "",
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: startEycaActivationDefaultDecoder()
};

const getEycaActivation: GetEycaActivationT = {
  method: "get",
  url: () => `${BASE_URL}/eyca/activation`,
  query: _ => ({}),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: getEycaActivationDefaultDecoder()
};

const getEycaStatus: GetEycaStatusT = {
  method: "get",
  url: () => `${BASE_URL}/eyca/status`,
  query: _ => ({}),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: getEycaStatusDefaultDecoder()
};

function ParamAuthorizationBearerHeaderProducer<
  P extends { readonly Bearer: string }
>(): RequestHeaderProducer<P, "Authorization"> {
  return (p: P): RequestHeaders<"Authorization"> => ({
    Authorization: `Bearer ${p.Bearer}`
  });
}

//
// A specific backend client to handle cgn requests
//
export function BackendCGN(
  baseUrl: string,
  token: string,
  fetchApi: typeof fetch = defaultRetryingFetch()
) {
  const options = {
    baseUrl,
    fetchApi
  };

  // withBearerToken injects the field 'Bearer' with value token into the parameter P
  // of the f function
  const withBearerToken = <P extends { Bearer: string }, R>(
    f: (p: P) => Promise<R>
  ) => async (po: Omit<P, "Bearer">): Promise<R> => {
    const params = Object.assign({ Bearer: String(token) }, po) as P;
    return f(params);
  };

  return {
    startCgnActivation: withBearerToken(
      createFetchRequestForApi(startCgnActivation, options)
    ),
    getCgnActivation: withBearerToken(
      createFetchRequestForApi(getCgnActivation, options)
    ),
    getCgnStatus: withBearerToken(
      createFetchRequestForApi(getCgnStatus, options)
    ),
    startEycaActivation: withBearerToken(
      createFetchRequestForApi(startEycaActivation, options)
    ),
    getEycaActivation: withBearerToken(
      createFetchRequestForApi(getEycaActivation, options)
    ),
    getEycaStatus: withBearerToken(
      createFetchRequestForApi(getEycaStatus, options)
    )
  };
}
