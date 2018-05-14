import { ExtendedProfile } from "../../definitions/backend/ExtendedProfile";
import { Installation } from "../../definitions/backend/Installation";
import { LimitedProfile } from "../../definitions/backend/LimitedProfile";
import { Messages } from "../../definitions/backend/Messages";
import { MessageWithContent } from "../../definitions/backend/MessageWithContent";
import { ProfileWithEmail } from "../../definitions/backend/ProfileWithEmail";
import { ProfileWithoutEmail } from "../../definitions/backend/ProfileWithoutEmail";
import { ServicePublic } from "../../definitions/backend/ServicePublic";

import {
  ApiHeaderJson,
  AuthorizationBearerHeaderProducer,
  basicResponseDecoder,
  BasicResponseType,
  composeHeaderProducers,
  composeResponseDecoders,
  createFetchRequestForApi,
  IGetApiRequestType,
  IPostApiRequestType,
  IPutApiRequestType
} from "../utils/api_request";

//
// Define the types of the requests
//

type GetServiceT = IGetApiRequestType<
  {
    id: string;
  },
  "Authorization",
  never,
  BasicResponseType<ServicePublic>
>;

type GetMessagesT = IGetApiRequestType<
  {
    cursor?: number;
  },
  "Authorization",
  "cursor",
  BasicResponseType<Messages>
>;

type GetMessageT = IGetApiRequestType<
  {
    id: string;
  },
  "Authorization",
  never,
  BasicResponseType<MessageWithContent>
>;

type GetProfileT = IGetApiRequestType<
  {},
  "Authorization",
  never,
  BasicResponseType<ProfileWithEmail | ProfileWithoutEmail>
>;

type CreateOrUpdateProfileT = IPostApiRequestType<
  {
    newProfile: ExtendedProfile;
  },
  "Authorization",
  never,
  BasicResponseType<LimitedProfile | ExtendedProfile>
>;

type CreateOrUpdateInstallationT = IPutApiRequestType<
  {
    id: string;
    installation: Installation;
  },
  "Authorization",
  never,
  BasicResponseType<Installation>
>;

//
// Create client
//

export function BackendClient(baseUrl: string, token: string) {
  const options = {
    baseUrl
  };

  const tokenHeaderProducer = AuthorizationBearerHeaderProducer(token);

  const getServiceT: GetServiceT = {
    method: "get",
    url: params => `/api/v1/services/${params.id}`,
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: basicResponseDecoder(ServicePublic)
  };

  const getMessagesT: GetMessagesT = {
    method: "get",
    url: () => `/api/v1/messages`,
    query: params => ({
      cursor: params.cursor ? `${params.cursor}` : ""
    }),
    headers: tokenHeaderProducer,
    response_decoder: basicResponseDecoder(Messages)
  };

  const getMessageT: GetMessageT = {
    method: "get",
    url: params => `/api/v1/messages/${params.id}`,
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: basicResponseDecoder(MessageWithContent)
  };

  const getProfileT: GetProfileT = {
    method: "get",
    url: () => "/api/v1/profile",
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: composeResponseDecoders(
      basicResponseDecoder(ProfileWithEmail),
      basicResponseDecoder(ProfileWithoutEmail)
    )
  };

  const createOrUpdateProfileT: CreateOrUpdateProfileT = {
    method: "post",
    url: () => "/api/v1/profile",
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _ => ({}),
    body: p => JSON.stringify(p.newProfile),
    response_decoder: composeResponseDecoders(
      basicResponseDecoder(LimitedProfile),
      basicResponseDecoder(ExtendedProfile)
    )
  };

  const createOrUpdateInstallationT: CreateOrUpdateInstallationT = {
    method: "put",
    url: params => `/api/v1/installations/${params.id}`,
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _ => ({}),
    body: p => JSON.stringify(p.installation),
    response_decoder: basicResponseDecoder(Installation)
  };

  return {
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
    )
  };
}
