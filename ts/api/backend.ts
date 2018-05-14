import { ExtendedProfile } from "../../definitions/backend/ExtendedProfile";
import { Message } from "../../definitions/backend/Message";
import { Profile } from "../../definitions/backend/Profile";

import {
  ApiHeaderJson,
  AuthorizationBearerHeaderProducer,
  basicResponseDecoder,
  BasicResponseType,
  composeHeaderProducers,
  createFetchRequestForApi,
  IGetApiRequestType,
  IPostApiRequestType
} from "../utils/api_request";

//
// Define the types of the requests
//

type GetMessageRequestType = IGetApiRequestType<
  {
    id: string;
  },
  "Authorization",
  never,
  BasicResponseType<Message>
>;

type GetProfileRequestType = IGetApiRequestType<
  {},
  "Authorization",
  never,
  BasicResponseType<Profile>
>;

type CreateOrUpdateProfileRequestType = IPostApiRequestType<
  {
    newProfile: ExtendedProfile;
  },
  "Authorization",
  never,
  BasicResponseType<Profile>
>;

//
// Create client
//

export function BackendClient(baseUrl: string, token: string) {
  const options = {
    baseUrl
  };

  const tokenHeaderProducer = AuthorizationBearerHeaderProducer(token);

  const getMessageRequestType: GetMessageRequestType = {
    method: "get",
    url: params => `/messages/${params.id}`,
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: basicResponseDecoder(Message)
  };

  const getProfileRequestType: GetProfileRequestType = {
    method: "get",
    url: () => "/profile",
    query: _ => ({}),
    headers: tokenHeaderProducer,
    response_decoder: basicResponseDecoder(Profile)
  };

  const createOrUpdateProfileRequestType: CreateOrUpdateProfileRequestType = {
    method: "post",
    url: () => "/profile",
    headers: composeHeaderProducers(tokenHeaderProducer, ApiHeaderJson),
    query: _ => ({}),
    body: p => JSON.stringify(p.newProfile),
    response_decoder: basicResponseDecoder(Profile)
  };

  return {
    getMessage: createFetchRequestForApi(getMessageRequestType, options),
    getProfile: createFetchRequestForApi(getProfileRequestType, options),
    createOrUpdateProfile: createFetchRequestForApi(
      createOrUpdateProfileRequestType,
      options
    )
  };
}
