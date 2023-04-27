import * as t from "io-ts";

import { DeferredPromise } from "@pagopa/ts-commons/lib/promises";
import {
  ApiHeaderJson,
  composeHeaderProducers,
  composeResponseDecoders as compD,
  constantResponseDecoder as constD,
  createFetchRequestForApi,
  ioResponseDecoder as ioD,
  IPostApiRequestType,
  IResponseType,
  ResponseDecoder
} from "@pagopa/ts-commons/lib/requests";
import { Tuple2 } from "@pagopa/ts-commons/lib/tuples";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import _ from "lodash";
import { ProblemJson } from "../../definitions/backend/ProblemJson";
import {
  AbortUserDataProcessingT,
  activatePaymentDefaultDecoder,
  ActivatePaymentT,
  createOrUpdateInstallationDefaultDecoder,
  CreateOrUpdateInstallationT,
  getActivationStatusDefaultDecoder,
  GetActivationStatusT,
  getPaymentInfoDefaultDecoder,
  GetPaymentInfoT,
  getServiceDefaultDecoder,
  getServicePreferencesDefaultDecoder,
  GetServicePreferencesT,
  GetServiceT,
  getSessionStateDefaultDecoder,
  GetSessionStateT,
  getSupportTokenDefaultDecoder,
  GetSupportTokenT,
  getUserDataProcessingDefaultDecoder,
  GetUserDataProcessingT,
  getUserMessageDefaultDecoder,
  getUserMessagesDefaultDecoder,
  getUserMetadataDefaultDecoder,
  GetUserMetadataT,
  GetUserProfileT,
  getVisibleServicesDefaultDecoder,
  GetVisibleServicesT,
  StartEmailValidationProcessT,
  updateProfileDefaultDecoder,
  UpdateProfileT,
  upsertServicePreferencesDefaultDecoder,
  UpsertServicePreferencesT,
  upsertUserDataProcessingDefaultDecoder,
  UpsertUserDataProcessingT,
  upsertUserMetadataDefaultDecoder,
  UpsertUserMetadataT,
  upsertMessageStatusAttributesDefaultDecoder,
  UpsertMessageStatusAttributesT,
  getUserProfileDefaultDecoder,
  GetThirdPartyMessageT,
  getThirdPartyMessageDefaultDecoder,
  GetThirdPartyMessagePreconditionT,
  getThirdPartyMessagePreconditionDefaultDecoder,
  GetUserMessagesT,
  GetUserMessageT,
  startEmailValidationProcessDefaultDecoder,
  abortUserDataProcessingDefaultDecoder
} from "../../definitions/backend/requestTypes";
import { SessionToken } from "../types/SessionToken";
import { constantPollingFetch, defaultRetryingFetch } from "../utils/fetch";
import {
  tokenHeaderProducer,
  withBearerToken as withToken
} from "../utils/api";
import { KeyInfo } from "../features/lollipop/utils/crypto";

/**
 * We will retry for as many times when polling for a payment ID.
 * The total maximum time we are going to wait will be:
 *
 * PAYMENT_ID_MAX_POLLING_RETRIES * PAYMENT_ID_RETRY_DELAY
 */
const PAYMENT_ID_MAX_POLLING_RETRIES = 180;

/**
 * How much time to wait between retries when polling for a payment ID
 */
const PAYMENT_ID_RETRY_DELAY = 1000 as Millisecond;

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

//
// Create client
//

// eslint-disable-next-line
export function BackendClient(
  baseUrl: string,
  token: SessionToken,
  _keyInfo: KeyInfo = {},
  fetchApi: typeof fetch = defaultRetryingFetch()
) {
  const options = {
    baseUrl,
    fetchApi
  };

  const getSessionT: GetSessionStateT = {
    method: "get",
    url: () => "/api/v1/session",
    query: _ => ({}),
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    response_decoder: getSessionStateDefaultDecoder()
  };

  const getServiceT: GetServiceT = {
    method: "get",
    url: params => `/api/v1/services/${params.service_id}`,
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: getServiceDefaultDecoder()
  };

  const getServicePreferenceT: GetServicePreferencesT = {
    method: "get",
    url: params => `/api/v1/services/${params.service_id}/preferences`,
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: getServicePreferencesDefaultDecoder()
  };

  const upsertServicePreferenceT: UpsertServicePreferencesT = {
    method: "post",
    url: params => `/api/v1/services/${params.service_id}/preferences`,
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _ => ({}),
    body: body => JSON.stringify(body.body),
    response_decoder: upsertServicePreferencesDefaultDecoder()
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
    url: _ => "/api/v1/messages",
    query: params => {
      const {
        maximum_id,
        enrich_result_data,
        minimum_id,
        page_size,
        archived
      } = params;
      return _.pickBy(
        {
          maximum_id,
          enrich_result_data,
          minimum_id,
          page_size,
          archived
        },
        v => !_.isUndefined(v)
      );
    },
    headers: tokenHeaderProducer,
    response_decoder: getUserMessagesDefaultDecoder()
  };

  const getMessageT: GetUserMessageT = {
    method: "get",
    url: params => `/api/v1/messages/${params.id}`,
    query: params => {
      const { public_message } = params;
      return _.pickBy(
        {
          public_message
        },
        v => !_.isUndefined(v)
      );
    },
    headers: tokenHeaderProducer,
    response_decoder: getUserMessageDefaultDecoder()
  };

  const getThirdPartyMessage: GetThirdPartyMessageT = {
    method: "get",
    url: ({ id }) => `/api/v1/third-party-messages/${id}`,
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _ => ({}),
    response_decoder: getThirdPartyMessageDefaultDecoder()
  };

  const getThirdPartyMessagePreconditionT: GetThirdPartyMessagePreconditionT = {
    method: "get",
    url: ({ id }) => `/api/v1/third-party-messages/${id}/precondition`,
    query: _ => ({}),
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    response_decoder: getThirdPartyMessagePreconditionDefaultDecoder()
  };

  const upsertMessageStatusAttributesT: UpsertMessageStatusAttributesT = {
    method: "put",
    url: params => `/api/v1/messages/${params.id}/message-status`,
    query: _ => ({}),
    body: params => JSON.stringify(params.body),
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    response_decoder: upsertMessageStatusAttributesDefaultDecoder()
  };

  const getProfileT: GetUserProfileT = {
    method: "get",
    url: () => "/api/v1/profile",
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: getUserProfileDefaultDecoder()
  };

  const createOrUpdateProfileT: UpdateProfileT = {
    method: "post",
    url: () => "/api/v1/profile",
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _ => ({}),
    body: p => JSON.stringify(p.body),
    response_decoder: updateProfileDefaultDecoder()
  };

  const getUserMetadataT: GetUserMetadataT = {
    method: "get",
    url: () => "/api/v1/user-metadata",
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: getUserMetadataDefaultDecoder()
  };

  const postStartEmailValidationProcessT: StartEmailValidationProcessT = {
    method: "post",
    url: () => "/api/v1/email-validation-process",
    query: _ => ({}),
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    body: _ => JSON.stringify({}),
    response_decoder: startEmailValidationProcessDefaultDecoder()
  };

  const createOrUpdateUserMetadataT: UpsertUserMetadataT = {
    method: "post",
    url: () => "/api/v1/user-metadata",
    query: _ => ({}),
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    body: p => JSON.stringify(p.body),
    response_decoder: upsertUserMetadataDefaultDecoder()
  };

  const getUserDataProcessingT: GetUserDataProcessingT = {
    method: "get",
    url: ({ choice }) => `/api/v1/user-data-processing/${choice}`,
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: getUserDataProcessingDefaultDecoder()
  };

  const postUserDataProcessingT: UpsertUserDataProcessingT = {
    method: "post",
    url: () => `/api/v1/user-data-processing`,
    query: _ => ({}),
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    body: _ => JSON.stringify(_.body),
    response_decoder: upsertUserDataProcessingDefaultDecoder()
  };

  const deleteUserDataProcessingT: AbortUserDataProcessingT = {
    method: "delete",
    url: ({ choice }) => `/api/v1/user-data-processing/${choice}`,
    query: _ => ({}),
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    response_decoder: abortUserDataProcessingDefaultDecoder()
  };

  const createOrUpdateInstallationT: CreateOrUpdateInstallationT = {
    method: "put",
    url: params => `/api/v1/installations/${params.installationID}`,
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _ => ({}),
    body: p => JSON.stringify(p.body),
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
    url: ({ rptId, test }) => `/api/v1/payment-requests/${rptId}?test=${test}`,
    headers: tokenHeaderProducer,
    query: _ => ({}),
    response_decoder: getPaymentInfoDefaultDecoder()
  };

  const attivaRptT: ActivatePaymentT = {
    method: "post",
    url: ({ test }) => `/api/v1/payment-activations?test=${test}`,
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: () => ({}),
    body: ({ body }) => JSON.stringify(body),
    response_decoder: activatePaymentDefaultDecoder()
  };

  const getPaymentIdT: GetActivationStatusT = {
    method: "get",
    url: ({ codiceContestoPagamento, test }) =>
      `/api/v1/payment-activations/${codiceContestoPagamento}?test=${test}`,
    headers: tokenHeaderProducer,
    query: () => ({}),
    response_decoder: getActivationStatusDefaultDecoder()
  };

  const getSupportToken: GetSupportTokenT = {
    method: "get",
    url: () => `/api/v1/token/support`,
    headers: tokenHeaderProducer,
    query: () => ({}),
    response_decoder: getSupportTokenDefaultDecoder()
  };
  const withBearerToken = withToken(token);
  return {
    getSession: withBearerToken(createFetchRequestForApi(getSessionT, options)),
    getService: withBearerToken(createFetchRequestForApi(getServiceT, options)),
    getServicePreference: withBearerToken(
      createFetchRequestForApi(getServicePreferenceT, options)
    ),
    upsertServicePreference: withBearerToken(
      createFetchRequestForApi(upsertServicePreferenceT, options)
    ),
    getVisibleServices: withBearerToken(
      createFetchRequestForApi(getVisibleServicesT, options)
    ),
    getMessages: withBearerToken(
      createFetchRequestForApi(getMessagesT, options)
    ),
    getMessage: withBearerToken(createFetchRequestForApi(getMessageT, options)),
    getThirdPartyMessage: withBearerToken(
      createFetchRequestForApi(getThirdPartyMessage, options)
    ),
    getThirdPartyMessagePrecondition: withBearerToken(
      createFetchRequestForApi(getThirdPartyMessagePreconditionT, options)
    ),
    upsertMessageStatusAttributes: withBearerToken(
      createFetchRequestForApi(upsertMessageStatusAttributesT, options)
    ),
    getProfile: withBearerToken(createFetchRequestForApi(getProfileT, options)),
    createOrUpdateProfile: withBearerToken(
      createFetchRequestForApi(createOrUpdateProfileT, options)
    ),
    getUserMetadata: withBearerToken(
      createFetchRequestForApi(getUserMetadataT, options)
    ),
    createOrUpdateUserMetadata: withBearerToken(
      createFetchRequestForApi(createOrUpdateUserMetadataT, options)
    ),
    createOrUpdateInstallation: withBearerToken(
      createFetchRequestForApi(createOrUpdateInstallationT, options)
    ),
    logout: withBearerToken(createFetchRequestForApi(logoutT, options)),
    getVerificaRpt: withBearerToken(
      createFetchRequestForApi(verificaRptT, options)
    ),
    postAttivaRpt: withBearerToken(
      createFetchRequestForApi(attivaRptT, options)
    ),
    getPaymentId: () => {
      // since we could abort the polling a new constantPollingFetch and DeferredPromise are created
      const shouldAbortPaymentIdPollingRequest = DeferredPromise<boolean>();
      const shouldAbort = shouldAbortPaymentIdPollingRequest.e1;
      const fetchPolling = constantPollingFetch(
        shouldAbort,
        PAYMENT_ID_MAX_POLLING_RETRIES,
        PAYMENT_ID_RETRY_DELAY
      );
      const request = withBearerToken(
        createFetchRequestForApi(getPaymentIdT, {
          ...options,
          fetchApi: fetchPolling
        })
      );
      return Tuple2(shouldAbortPaymentIdPollingRequest, request);
    },
    startEmailValidationProcess: withBearerToken(
      createFetchRequestForApi(postStartEmailValidationProcessT, options)
    ),
    getUserDataProcessingRequest: withBearerToken(
      createFetchRequestForApi(getUserDataProcessingT, options)
    ),
    postUserDataProcessingRequest: withBearerToken(
      createFetchRequestForApi(postUserDataProcessingT, options)
    ),
    getSupportToken: withBearerToken(
      createFetchRequestForApi(getSupportToken, options)
    ),
    deleteUserDataProcessingRequest: withBearerToken(
      createFetchRequestForApi(deleteUserDataProcessingT, options)
    )
  };
}
