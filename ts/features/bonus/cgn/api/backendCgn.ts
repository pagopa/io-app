import {
  ApiHeaderJson,
  composeHeaderProducers,
  createFetchRequestForApi,
  RequestHeaderProducer,
  RequestHeaders
} from "@pagopa/ts-commons/lib/requests";
import { defaultRetryingFetch } from "../../../../utils/fetch";
import {
  generateOtpDefaultDecoder,
  GenerateOtpT,
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
  startCgnUnsubscriptionDefaultDecoder,
  StartCgnUnsubscriptionT,
  startEycaActivationDefaultDecoder,
  StartEycaActivationT
} from "../../../../../definitions/cgn/requestTypes";
import { withBearerToken as withToken } from "../../../../utils/api";

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

const generateOtp: GenerateOtpT = {
  method: "post",
  url: () => `${BASE_URL}/otp`,
  query: _ => ({}),
  body: () => "",
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: generateOtpDefaultDecoder()
};

const startCgnUnsubscription: StartCgnUnsubscriptionT = {
  method: "post",
  url: () => `${BASE_URL}/delete`,
  query: _ => ({}),
  body: _ => JSON.stringify({}),
  headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
  response_decoder: startCgnUnsubscriptionDefaultDecoder()
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
  const withBearerToken = withToken(token);
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
    ),
    generateOtp: withBearerToken(
      createFetchRequestForApi(generateOtp, options)
    ),
    startCgnUnsubscription: withBearerToken(
      createFetchRequestForApi(startCgnUnsubscription, options)
    )
  };
}
