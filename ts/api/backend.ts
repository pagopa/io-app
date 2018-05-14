import { ExtendedProfile } from "../../definitions/backend/ExtendedProfile";
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

  const getProfileRequestType: GetProfileRequestType = {
    method: "get",
    url: "/api/v1/profile",
    query: _ => ({}),
    headers: AuthorizationBearerHeaderProducer(token),
    response_decoder: basicResponseDecoder(Profile)
  };

  const createOrUpdateProfileRequestType: CreateOrUpdateProfileRequestType = {
    method: "post",
    url: "/api/v1/profile",
    headers: composeHeaderProducers(
      AuthorizationBearerHeaderProducer(token),
      ApiHeaderJson
    ),
    query: _ => ({}),
    body: p => JSON.stringify(p.newProfile),
    response_decoder: basicResponseDecoder(Profile)
  };

  return {
    getProfile: createFetchRequestForApi(getProfileRequestType, options),
    createOrUpdateProfile: createFetchRequestForApi(
      createOrUpdateProfileRequestType,
      options
    )
  };
}
