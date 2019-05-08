import * as t from "io-ts";
import {
  ApiHeaderJson,
  composeHeaderProducers,
  composeResponseDecoders as compD,
  constantResponseDecoder as constD,
  createFetchRequestForApi,
  ioResponseDecoder as ioD,
  IPostApiRequestType,
  IResponseType,
  RequestHeaderProducer,
  RequestHeaders,
  ResponseDecoder
} from "italia-ts-commons/lib/requests";
import { AuthenticatedProfile } from "../../definitions/backend/AuthenticatedProfile";
import { InitializedProfile } from "../../definitions/backend/InitializedProfile";
import { ProblemJson } from "../../definitions/backend/ProblemJson";

import {
  activatePaymentDefaultDecoder,
  ActivatePaymentT,
  createOrUpdateInstallationDefaultDecoder,
  CreateOrUpdateInstallationT,
  getActivationStatusDefaultDecoder,
  GetActivationStatusT,
  getPaymentInfoDefaultDecoder,
  GetPaymentInfoT,
  getServiceDefaultDecoder,
  GetServiceT,
  getSessionStateDefaultDecoder,
  GetSessionStateT,
  getUserMessageDefaultDecoder,
  getUserMessagesDefaultDecoder,
  GetUserMessagesT,
  GetUserMessageT,
  getUserProfileDecoder,
  GetUserProfileT,
  getVisibleServicesDefaultDecoder,
  GetVisibleServicesT,
  upsertProfileDefaultDecoder,
  UpsertProfileT
} from "../../definitions/backend/requestTypes";

import { SessionToken } from "../types/SessionToken";
import { defaultRetryingFetch } from "../utils/fetch";
import { withBearerToken } from "../utils/request";

/**
 * Here we have to redefine the auto-generated UserProfile type since the
 * generated one is not a discriminated union (swagger specs don't support
 * constant values that can discriminate union types).
 */
export const UserProfileUnion = t.union([
  t.intersection([
    InitializedProfile,
    t.interface({ has_profile: t.literal(true) })
  ]),
  t.intersection([
    AuthenticatedProfile,
    t.interface({ has_profile: t.literal(false) })
  ])
]);

export type UserProfileUnion = t.TypeOf<typeof UserProfileUnion>;

//
// Other helper types
//

const SuccessResponse = t.interface({
  message: t.string
});

type SuccessResponse = t.TypeOf<typeof SuccessResponse>;

//
// Define the types of the requests
//

/**
 *  The base response type defines 200, 401 and 500 statuses
 */
type BaseResponseType<R> =
  | IResponseType<200, R>
  | IResponseType<401, undefined>
  | IResponseType<500, ProblemJson>;

/**
 * A response decoder for base response types
 */
function baseResponseDecoder<R, O = R>(
  type: t.Type<R, O>
): ResponseDecoder<BaseResponseType<R>> {
  return compD(
    compD(ioD<200, R, O>(200, type), constD<undefined, 401>(401, undefined)),
    ioD<500, ProblemJson>(500, ProblemJson)
  );
}

/**
 * Specific for the nodo-related requests
 */

export type LogoutT = IPostApiRequestType<
  { readonly Bearer: string },
  "Authorization" | "Content-Type",
  never,
  BaseResponseType<SuccessResponse>
>;

function ParamAuthorizationBearerHeaderProducer<
  P extends { readonly Bearer: string }
>(): RequestHeaderProducer<P, "Authorization"> {
  return (p: P): RequestHeaders<"Authorization"> => {
    return {
      Authorization: `Bearer ${p.Bearer}`
    };
  };
}

//
// Create client
//

export function BackendClient(
  baseUrl: string,
  token: SessionToken,
  fetchApi: typeof fetch = defaultRetryingFetch()
) {
  const options = {
    baseUrl,
    fetchApi
  };

  const tokenHeaderProducer = ParamAuthorizationBearerHeaderProducer();

  const getSessionT: GetSessionStateT = {
    method: "get",
    url: () => "/api/v1/session",
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: getSessionStateDefaultDecoder()
  };

  const getServiceT: GetServiceT = {
    method: "get",
    url: params => `/api/v1/services/${params.service_id}`,
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: getServiceDefaultDecoder()
  };

  const getVisibleServicesT: GetVisibleServicesT = {
    method: "get",
    url: () => "/api/v1/services",
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: getVisibleServicesDefaultDecoder()
  };

  const getMessagesT: GetUserMessagesT = {
    method: "get",
    url: () => `/api/v1/messages`,
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: getUserMessagesDefaultDecoder()
  };

  const getMessageT: GetUserMessageT = {
    method: "get",
    url: params => `/api/v1/messages/${params.id}`,
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: getUserMessageDefaultDecoder()
  };

  const getProfileT: GetUserProfileT = {
    method: "get",
    url: () => "/api/v1/profile",
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: getUserProfileDecoder(UserProfileUnion)
  };

  const createOrUpdateProfileT: UpsertProfileT = {
    method: "post",
    url: () => "/api/v1/profile",
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _ => ({}),
    body: p => JSON.stringify(p.extendedProfile),
    response_decoder: upsertProfileDefaultDecoder()
  };

  const createOrUpdateInstallationT: CreateOrUpdateInstallationT = {
    method: "put",
    url: params => `/api/v1/installations/${params.installationID}`,
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _ => ({}),
    body: p => JSON.stringify(p.installation),
    response_decoder: createOrUpdateInstallationDefaultDecoder()
  };

  const logoutT: LogoutT = {
    method: "post",
    url: () => "/logout",
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _ => ({}),
    body: _ => JSON.stringify({}),
    response_decoder: baseResponseDecoder(SuccessResponse)
  };

  const verificaRptT: GetPaymentInfoT = {
    method: "get",
    url: ({ rptId }) => `/api/v1/payment-requests/${rptId}`,
    headers: tokenHeaderProducer,
    query: _ => ({}),
    response_decoder: getPaymentInfoDefaultDecoder()
  };

  const attivaRptT: ActivatePaymentT = {
    method: "post",
    url: () => "/api/v1/payment-activations",
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: () => ({}),
    body: ({ paymentActivationsPostRequest }) =>
      JSON.stringify(paymentActivationsPostRequest),
    response_decoder: activatePaymentDefaultDecoder()
  };

  const getPaymentIdT: GetActivationStatusT = {
    method: "get",
    url: ({ codiceContestoPagamento }) =>
      `/api/v1/payment-activations/${codiceContestoPagamento}`,
    headers: tokenHeaderProducer,
    query: () => ({}),
    response_decoder: getActivationStatusDefaultDecoder()
  };

  return {
    getSession: withBearerToken(
      token,
      createFetchRequestForApi(getSessionT, options)
    ),
    getService: withBearerToken(
      token,
      createFetchRequestForApi(getServiceT, options)
    ),
    getVisibleServices: withBearerToken(
      token,
      createFetchRequestForApi(getVisibleServicesT, options)
    ),
    getMessages: createFetchRequestForApi(getMessagesT, options),
    getMessage: createFetchRequestForApi(getMessageT, options),
    getProfile: withBearerToken(
      token,
      createFetchRequestForApi(getProfileT, options)
    ),
    createOrUpdateProfile: withBearerToken(
      token,
      createFetchRequestForApi(createOrUpdateProfileT, options)
    ),
    createOrUpdateInstallation: createFetchRequestForApi(
      createOrUpdateInstallationT,
      options
    ),
    logout: createFetchRequestForApi(logoutT, options),
    getVerificaRpt: createFetchRequestForApi(verificaRptT, options),
    postAttivaRpt: createFetchRequestForApi(attivaRptT, options),
    getPaymentId: createFetchRequestForApi(getPaymentIdT, options)
  };
}
