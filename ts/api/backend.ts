import * as t from "io-ts";
import * as r from "italia-ts-commons/lib/requests";
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
import { Omit } from "italia-ts-commons/lib/types";
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
  getUserDataProcessingDefaultDecoder,
  GetUserDataProcessingT,
  getUserMessageDefaultDecoder,
  getUserMessagesDefaultDecoder,
  GetUserMessagesT,
  GetUserMessageT,
  getUserMetadataDefaultDecoder,
  GetUserMetadataT,
  getUserProfileDecoder,
  GetUserProfileT,
  getVisibleServicesDefaultDecoder,
  GetVisibleServicesT,
  StartEmailValidationProcessT,
  updateProfileDefaultDecoder,
  UpdateProfileT,
  upsertUserDataProcessingDefaultDecoder,
  UpsertUserDataProcessingT,
  upsertUserMetadataDefaultDecoder,
  UpsertUserMetadataT
} from "../../definitions/backend/requestTypes";

import { SessionToken } from "../types/SessionToken";
import { defaultRetryingFetch } from "../utils/fetch";

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

// tslint:disable-next-line: no-big-function
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
    response_decoder: getUserProfileDecoder(InitializedProfile)
  };

  const createOrUpdateProfileT: UpdateProfileT = {
    method: "post",
    url: () => "/api/v1/profile",
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _ => ({}),
    body: p => JSON.stringify(p.profile),
    response_decoder: updateProfileDefaultDecoder()
  };

  const getUserMetadataT: GetUserMetadataT = {
    method: "get",
    url: () => "/api/v1/user-metadata",
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: getUserMetadataDefaultDecoder()
  };

  // Custom decoder until we fix the problem in the io-utils generator
  // https://www.pivotaltracker.com/story/show/169915207
  const startEmailValidationCustomDecoder = () => {
    return r.composeResponseDecoders(
      r.composeResponseDecoders(
        r.composeResponseDecoders(
          r.composeResponseDecoders(
            r.composeResponseDecoders(
              r.constantResponseDecoder<undefined, 202>(202, undefined),
              r.ioResponseDecoder<
                400,
                (typeof ProblemJson)["_A"],
                (typeof ProblemJson)["_O"]
              >(400, ProblemJson)
            ),
            r.constantResponseDecoder<undefined, 401>(401, undefined)
          ),
          r.ioResponseDecoder<
            404,
            (typeof ProblemJson)["_A"],
            (typeof ProblemJson)["_O"]
          >(404, ProblemJson)
        ),
        r.ioResponseDecoder<
          429,
          (typeof ProblemJson)["_A"],
          (typeof ProblemJson)["_O"]
        >(429, ProblemJson)
      ),
      r.ioResponseDecoder<
        500,
        (typeof ProblemJson)["_A"],
        (typeof ProblemJson)["_O"]
      >(500, ProblemJson)
    );
  };

  const postStartEmailValidationProcessT: StartEmailValidationProcessT = {
    method: "post",
    url: () => "/api/v1/email-validation-process",
    query: _ => ({}),
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    body: _ => JSON.stringify({}),
    response_decoder: startEmailValidationCustomDecoder()
  };

  const createOrUpdateUserMetadataT: UpsertUserMetadataT = {
    method: "post",
    url: () => "/api/v1/user-metadata",
    query: _ => ({}),
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    body: p => JSON.stringify(p.userMetadata),
    response_decoder: upsertUserMetadataDefaultDecoder()
  };

  const getUserDataProcessingT: GetUserDataProcessingT = {
    method: "get",
    url: ({ userDataProcessingChoiceParam }) =>
      `/api/v1/user-data-processing/${userDataProcessingChoiceParam}`,
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: getUserDataProcessingDefaultDecoder()
  };

  const postUserDataProcessingT: UpsertUserDataProcessingT = {
    method: "post",
    url: () => `/api/v1/user-data-processing`,
    query: _ => ({}),
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    body: _ => JSON.stringify(_.userDataProcessingChoiceRequest),
    response_decoder: upsertUserDataProcessingDefaultDecoder()
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
    body: ({ paymentActivationsPostRequest }) =>
      JSON.stringify(paymentActivationsPostRequest),
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

  // withBearerToken injects the field 'Baerer' with value token into the parameter P
  // of the f function
  const withBearerToken = <P extends { Bearer: string }, R>(
    f: (p: P) => Promise<R>
  ) => async (po: Omit<P, "Bearer">): Promise<R> => {
    const params = Object.assign({ Bearer: String(token) }, po) as P;
    return f(params);
  };

  return {
    getSession: withBearerToken(createFetchRequestForApi(getSessionT, options)),
    getService: withBearerToken(createFetchRequestForApi(getServiceT, options)),
    getVisibleServices: withBearerToken(
      createFetchRequestForApi(getVisibleServicesT, options)
    ),
    getMessages: withBearerToken(
      createFetchRequestForApi(getMessagesT, options)
    ),
    getMessage: withBearerToken(createFetchRequestForApi(getMessageT, options)),
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
    getPaymentId: withBearerToken(
      createFetchRequestForApi(getPaymentIdT, options)
    ),
    startEmailValidationProcess: withBearerToken(
      createFetchRequestForApi(postStartEmailValidationProcessT, options)
    ),
    getUserDataProcessingRequest: withBearerToken(
      createFetchRequestForApi(getUserDataProcessingT, options)
    ),
    postUserDataProcessingRequest: withBearerToken(
      createFetchRequestForApi(postUserDataProcessingT, options)
    )
  };
}
