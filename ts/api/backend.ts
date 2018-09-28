import * as t from "io-ts";
import {
  ApiHeaderJson,
  AuthorizationBearerHeaderProducer,
  basicResponseDecoder,
  composeHeaderProducers,
  composeResponseDecoders as compD,
  constantResponseDecoder as constD,
  createFetchRequestForApi,
  ioResponseDecoder as ioD,
  IPostApiRequestType,
  IResponseType,
  ResponseDecoder
} from "italia-ts-commons/lib/requests";

import { AuthenticatedProfile } from "../../definitions/backend/AuthenticatedProfile";
import { CreatedMessageWithContent } from "../../definitions/backend/CreatedMessageWithContent";
import { CreateOrUpdateInstallationResponse } from "../../definitions/backend/CreateOrUpdateInstallationResponse";
import { InitializedProfile } from "../../definitions/backend/InitializedProfile";
import { Messages } from "../../definitions/backend/Messages";
import { PaymentActivationsGetResponse } from "../../definitions/backend/PaymentActivationsGetResponse";
import { PaymentProblemJson } from "../../definitions/backend/PaymentProblemJson";
import { PaymentRequestsGetResponse } from "../../definitions/backend/PaymentRequestsGetResponse";
import { ProblemJson } from "../../definitions/backend/ProblemJson";
import { PublicSession } from "../../definitions/backend/PublicSession";
import { ServicePublic } from "../../definitions/backend/ServicePublic";

import {
  ActivatePaymentT,
  CreateOrUpdateInstallationT,
  GetActivationStatusT,
  GetPaymentInfoT,
  GetServiceT,
  GetSessionStateT,
  GetUserMessagesT,
  GetUserMessageT,
  GetUserProfileT,
  UpsertProfileT
} from "../../definitions/backend/requestTypes";

import { SessionToken } from "../types/SessionToken";

import { defaultRetryingFetch } from "../utils/fetch";

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
 *  The extra response type adds the 400 status to the base response type
 */
export type ExtraResponseType<R> =
  | BaseResponseType<R>
  | IResponseType<400, ProblemJson>;

/**
 * A response decoder for extra response types
 */
function extraResponseDecoder<R>(
  type: t.Type<R, R>
): ResponseDecoder<ExtraResponseType<R>> {
  return compD(
    baseResponseDecoder(type),
    ioD<400, ProblemJson>(400, ProblemJson)
  );
}

const paymentResponseDecoder = compD(
  compD(
    compD(
      ioD<200, PaymentRequestsGetResponse>(200, PaymentRequestsGetResponse),
      ioD<400, ProblemJson>(400, ProblemJson)
    ),
    constD<undefined, 401>(401, undefined)
  ),
  ioD<500, PaymentProblemJson>(500, PaymentProblemJson)
);

export type LogoutT = IPostApiRequestType<
  {},
  "Authorization" | "Content-Type",
  never,
  BaseResponseType<SuccessResponse>
>;

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

  const tokenHeaderProducer = AuthorizationBearerHeaderProducer(token);

  const getSessionT: GetSessionStateT = {
    method: "get",
    url: () => "/api/v1/session",
    query: _ => ({}),
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    response_decoder: baseResponseDecoder(PublicSession)
  };

  const getServiceT: GetServiceT = {
    method: "get",
    url: params => `/api/v1/services/${params.service_id}`,
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: baseResponseDecoder(ServicePublic)
  };

  const getMessagesT: GetUserMessagesT = {
    method: "get",
    url: () => `/api/v1/messages`,
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: baseResponseDecoder(Messages)
  };

  const getMessageT: GetUserMessageT = {
    method: "get",
    url: params => `/api/v1/messages/${params.id}`,
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: basicResponseDecoder(CreatedMessageWithContent)
  };

  const getProfileT: GetUserProfileT = {
    method: "get",
    url: () => "/api/v1/profile",
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: baseResponseDecoder(UserProfileUnion)
  };

  const createOrUpdateProfileT: UpsertProfileT = {
    method: "post",
    url: () => "/api/v1/profile",
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _ => ({}),
    body: p => JSON.stringify(p.extendedProfile),
    response_decoder: extraResponseDecoder(InitializedProfile)
  };

  const createOrUpdateInstallationT: CreateOrUpdateInstallationT = {
    method: "put",
    url: params => `/api/v1/installations/${params.installationID}`,
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _ => ({}),
    body: p => JSON.stringify(p.installation),
    response_decoder: baseResponseDecoder(CreateOrUpdateInstallationResponse)
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
    response_decoder: paymentResponseDecoder
  };

  const attivaRptT: ActivatePaymentT = {
    method: "post",
    url: () => "/api/v1/payment-activations",
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: () => ({}),
    body: ({ paymentActivationsPostRequest }) =>
      JSON.stringify(paymentActivationsPostRequest),
    response_decoder: paymentResponseDecoder
  };

  const getPaymentIdT: GetActivationStatusT = {
    method: "get",
    url: ({ codiceContestoPagamento }) =>
      `/api/v1/payment-activations/${codiceContestoPagamento}`,
    headers: tokenHeaderProducer,
    query: () => ({}),
    response_decoder: extraResponseDecoder(PaymentActivationsGetResponse)
  };

  return {
    getSession: createFetchRequestForApi(getSessionT, options),
    getService: createFetchRequestForApi(getServiceT, options),
    getMessages: createFetchRequestForApi(getMessagesT, options),
    getMessage: createFetchRequestForApi(getMessageT, options),
    getProfile: createFetchRequestForApi(getProfileT, options),
    createOrUpdateProfile: createFetchRequestForApi(
      createOrUpdateProfileT,
      options
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
