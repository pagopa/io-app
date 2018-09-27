import * as t from "io-ts";
import {
  ApiHeaderJson,
  AuthorizationBearerHeaderProducer,
  basicResponseDecoder,
  composeHeaderProducers,
  composeResponseDecoders,
  createFetchRequestForApi,
  ioResponseDecoder,
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
import { PaymentActivationsPostResponse } from "../../definitions/backend/PaymentActivationsPostResponse";
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

import { GetPaymentProblemJson } from "../../definitions/backend/GetPaymentProblemJson";
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
 * A response decoder that ignores the payload and returns undefined
 */
function undefinedResponseDecoder<S extends number, H extends string = never>(
  status: S
): ResponseDecoder<IResponseType<S, undefined, H>> {
  return async response => {
    if (response.status !== status) {
      return undefined;
    }
    return {
      // tslint:disable-next-line:no-any
      headers: response.headers as any,
      status,
      value: undefined
    };
  };
}

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
  return composeResponseDecoders(
    composeResponseDecoders(
      ioResponseDecoder<200, R, O>(200, type),
      undefinedResponseDecoder<401>(401)
    ),
    ioResponseDecoder<500, ProblemJson>(500, ProblemJson)
  );
}

/**
 *  The extra response type adds the 400 status to the base response type
 */
export type ExtraResponseType<R> =
  | BaseResponseType<R>
  | IResponseType<400, ProblemJson>;

/**
 * Specific for the nodo-related requests
 */

export type NodoErrorResponseType =
  | IResponseType<400, GetPaymentProblemJson>
  | IResponseType<401, undefined>
  | IResponseType<500, GetPaymentProblemJson>;

export type NodoResponseType<R> = IResponseType<200, R> | NodoErrorResponseType;

/**
 * A response decoder for extra response types
 */
function extraResponseDecoder<R>(
  type: t.Type<R, R>
): ResponseDecoder<ExtraResponseType<R>> {
  return composeResponseDecoders(
    baseResponseDecoder(type),
    ioResponseDecoder<400, ProblemJson>(400, ProblemJson)
  );
}

export type ExtraResponseTypeWith404<R> =
  | ExtraResponseType<R>
  | IResponseType<404, ProblemJson>;

function extraResponseDecoderWith404<R>(
  type: t.Type<R, R>
): ResponseDecoder<ExtraResponseTypeWith404<R>> {
  return composeResponseDecoders(
    extraResponseDecoder(type),
    ioResponseDecoder<404, ProblemJson>(404, ProblemJson)
  );
}

/**
 * A response decoder for extra response types
 */
function extraNodoResponseDecoder<R>(
  type: t.Type<R, R>
): ResponseDecoder<NodoResponseType<R>> {
  return composeResponseDecoders(
    baseResponseDecoder(type),
    ioResponseDecoder<400, GetPaymentProblemJson>(400, GetPaymentProblemJson)
  );
}

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
    response_decoder: extraNodoResponseDecoder(PaymentRequestsGetResponse)
  };

  const attivaRptT: ActivatePaymentT = {
    method: "post",
    url: () => "/api/v1/payment-activations",
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: () => ({}),
    body: ({ paymentActivationsPostRequest }) =>
      JSON.stringify(paymentActivationsPostRequest),
    response_decoder: extraNodoResponseDecoder(PaymentActivationsPostResponse)
  };

  const getPaymentIdT: GetActivationStatusT = {
    method: "get",
    url: ({ codiceContestoPagamento }) =>
      `/api/v1/payment-activations/${codiceContestoPagamento}`,
    headers: tokenHeaderProducer,
    query: () => ({}),
    response_decoder: extraResponseDecoderWith404(PaymentActivationsGetResponse)
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
