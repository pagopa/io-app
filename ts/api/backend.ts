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
  ResponseDecoder
} from "@pagopa/ts-commons/lib/requests";
import _ from "lodash";
import { v4 as uuid } from "uuid";
import { withoutUndefinedValues } from "@pagopa/ts-commons/lib/types";
import { ProblemJson } from "../../definitions/backend/ProblemJson";
import {
  AbortUserDataProcessingT,
  createOrUpdateInstallationDefaultDecoder,
  CreateOrUpdateInstallationT,
  getServicePreferencesDefaultDecoder,
  GetServicePreferencesT,
  getUserDataProcessingDefaultDecoder,
  GetUserDataProcessingT,
  getUserMessageDefaultDecoder,
  getUserMessagesDefaultDecoder,
  GetUserProfileT,
  StartEmailValidationProcessT,
  updateProfileDefaultDecoder,
  UpdateProfileT,
  upsertServicePreferencesDefaultDecoder,
  UpsertServicePreferencesT,
  upsertUserDataProcessingDefaultDecoder,
  UpsertUserDataProcessingT,
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
  abortUserDataProcessingDefaultDecoder,
  GetPaymentInfoV2T,
  getPaymentInfoV2DefaultDecoder
} from "../../definitions/backend/requestTypes";
import { defaultRetryingFetch } from "../utils/fetch";
import {
  tokenHeaderProducer,
  withBearerToken as withToken
} from "../utils/api";
import { KeyInfo } from "../features/lollipop/utils/crypto";
import { lollipopFetch } from "../features/lollipop/utils/fetch";
import {
  getSessionStateDefaultDecoder,
  GetSessionStateT
} from "../../definitions/session_manager/requestTypes";

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

export function BackendClient(
  baseUrl: string,
  token: string,
  _keyInfo: KeyInfo = {},
  fetchApi: typeof fetch = defaultRetryingFetch()
) {
  const options = {
    baseUrl,
    fetchApi
  };

  const getSessionT: GetSessionStateT = {
    method: "get",
    url: () => "/api/auth/v1/session",
    query: ({ ["fields"]: fields }) =>
      withoutUndefinedValues({ ["fields"]: fields }),
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    response_decoder: getSessionStateDefaultDecoder()
  };

  const getServicePreferenceT: GetServicePreferencesT = {
    method: "get",
    url: params => `/api/v1/services/${params.service_id}/preferences`,
    query: _q1 => ({}),
    headers: tokenHeaderProducer,
    response_decoder: getServicePreferencesDefaultDecoder()
  };

  const upsertServicePreferenceT: UpsertServicePreferencesT = {
    method: "post",
    url: params => `/api/v1/services/${params.service_id}/preferences`,
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _q2 => ({}),
    body: body => JSON.stringify(body.body),
    response_decoder: upsertServicePreferencesDefaultDecoder()
  };

  const getMessagesT: GetUserMessagesT = {
    method: "get",
    url: _q3 => "/api/v1/messages",
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

  const getThirdPartyMessageT: GetThirdPartyMessageT = {
    method: "get",
    url: ({ id }) => `/api/v1/third-party-messages/${id}`,
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _q4 => ({}),
    response_decoder: getThirdPartyMessageDefaultDecoder()
  };

  const getThirdPartyMessagePreconditionT: GetThirdPartyMessagePreconditionT = {
    method: "get",
    url: ({ id }) => `/api/v1/third-party-messages/${id}/precondition`,
    query: _q5 => ({}),
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    response_decoder: getThirdPartyMessagePreconditionDefaultDecoder()
  };

  const upsertMessageStatusAttributesT: UpsertMessageStatusAttributesT = {
    method: "put",
    url: params => `/api/v1/messages/${params.id}/message-status`,
    query: _q6 => ({}),
    body: params => JSON.stringify(params.body),
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    response_decoder: upsertMessageStatusAttributesDefaultDecoder()
  };

  const getProfileT: GetUserProfileT = {
    method: "get",
    url: () => "/api/v1/profile",
    query: _q7 => ({}),
    headers: tokenHeaderProducer,
    response_decoder: getUserProfileDefaultDecoder()
  };

  const createOrUpdateProfileT: UpdateProfileT = {
    method: "post",
    url: () => "/api/v1/profile",
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _q8 => ({}),
    body: p => JSON.stringify(p.body),
    response_decoder: updateProfileDefaultDecoder()
  };

  const postStartEmailValidationProcessT: StartEmailValidationProcessT = {
    method: "post",
    url: () => "/api/v1/email-validation-process",
    query: _q9 => ({}),
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    body: _b1 => JSON.stringify({}),
    response_decoder: startEmailValidationProcessDefaultDecoder()
  };

  const getUserDataProcessingT: GetUserDataProcessingT = {
    method: "get",
    url: ({ choice }) => `/api/v1/user-data-processing/${choice}`,
    query: _q10 => ({}),
    headers: tokenHeaderProducer,
    response_decoder: getUserDataProcessingDefaultDecoder()
  };

  const postUserDataProcessingT: UpsertUserDataProcessingT = {
    method: "post",
    url: () => `/api/v1/user-data-processing`,
    query: _q11 => ({}),
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    body: inputData => JSON.stringify(inputData.body),
    response_decoder: upsertUserDataProcessingDefaultDecoder()
  };

  const deleteUserDataProcessingT: AbortUserDataProcessingT = {
    method: "delete",
    url: ({ choice }) => `/api/v1/user-data-processing/${choice}`,
    query: _q12 => ({}),
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    response_decoder: abortUserDataProcessingDefaultDecoder()
  };

  const createOrUpdateInstallationT: CreateOrUpdateInstallationT = {
    method: "put",
    url: params => `/api/v1/installations/${params.installationID}`,
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _q13 => ({}),
    body: p => JSON.stringify(p.body),
    response_decoder: createOrUpdateInstallationDefaultDecoder()
  };

  const logoutT: LogoutT = {
    method: "post",
    url: () => "/api/auth/v1/logout",
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _q14 => ({}),
    body: _b3 => JSON.stringify({}),
    response_decoder: baseResponseDecoder(SuccessResponse)
  };

  const getPaymentInfoV2T: GetPaymentInfoV2T = {
    method: "get",
    url: ({ ["rptId"]: rptId }) => `/api/v1/payment-info/${rptId}`,
    headers: tokenHeaderProducer,
    query: ({ ["test"]: test }) => withoutUndefinedValues({ ["test"]: test }),
    response_decoder: getPaymentInfoV2DefaultDecoder()
  };

  const withBearerToken = withToken(token);
  return {
    getSession: withBearerToken(createFetchRequestForApi(getSessionT, options)),
    getServicePreference: withBearerToken(
      createFetchRequestForApi(getServicePreferenceT, options)
    ),
    upsertServicePreference: withBearerToken(
      createFetchRequestForApi(upsertServicePreferenceT, options)
    ),
    getMessages: withBearerToken(
      createFetchRequestForApi(getMessagesT, options)
    ),
    getMessage: withBearerToken(createFetchRequestForApi(getMessageT, options)),
    getThirdPartyMessage: () =>
      withBearerToken(
        createFetchRequestForApi(getThirdPartyMessageT, {
          ...options,
          fetchApi: lollipopFetch({ nonce: uuid() }, _keyInfo)
        })
      ),
    getThirdPartyMessagePrecondition: () =>
      withBearerToken(
        createFetchRequestForApi(getThirdPartyMessagePreconditionT, {
          ...options,
          fetchApi: lollipopFetch({ nonce: uuid() }, _keyInfo)
        })
      ),
    upsertMessageStatusAttributes: withBearerToken(
      createFetchRequestForApi(upsertMessageStatusAttributesT, options)
    ),
    getProfile: withBearerToken(createFetchRequestForApi(getProfileT, options)),
    createOrUpdateProfile: withBearerToken(
      createFetchRequestForApi(createOrUpdateProfileT, options)
    ),
    createOrUpdateInstallation: withBearerToken(
      createFetchRequestForApi(createOrUpdateInstallationT, options)
    ),
    logout: withBearerToken(createFetchRequestForApi(logoutT, options)),
    getPaymentInfoV2: withBearerToken(
      createFetchRequestForApi(getPaymentInfoV2T, options)
    ),
    startEmailValidationProcess: withBearerToken(
      createFetchRequestForApi(postStartEmailValidationProcessT, options)
    ),
    getUserDataProcessingRequest: withBearerToken(
      createFetchRequestForApi(getUserDataProcessingT, options)
    ),
    postUserDataProcessingRequest: withBearerToken(
      createFetchRequestForApi(postUserDataProcessingT, options)
    ),
    deleteUserDataProcessingRequest: withBearerToken(
      createFetchRequestForApi(deleteUserDataProcessingT, options)
    ),
    isSameClient: (sessionToken: string, keyInfo?: KeyInfo) =>
      _.isEqual(_keyInfo, keyInfo) && token === sessionToken
  };
}

export type BackendClient = ReturnType<typeof BackendClient>;
