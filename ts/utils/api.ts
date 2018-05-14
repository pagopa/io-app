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
} from "./api_request";

interface IBaseApiParams {
  token: string;
}

//
// GetUserProfile
//

type GetUserProfileRequestType = IGetApiRequestType<
  IBaseApiParams,
  "Authorization",
  never,
  BasicResponseType<Profile>
>;

const getUserProfileRequestType: GetUserProfileRequestType = {
  method: "get",
  url: "/api/v1/profile",
  query: _ => ({}),
  headers: new AuthorizationBearerHeaderProducer<IBaseApiParams>(),
  response_decoder: basicResponseDecoder(Profile)
};

export const getUserProfile = createFetchRequestForApi(
  getUserProfileRequestType
);

//
// SetUserProfile
//

interface ISetProfileParams extends IBaseApiParams {
  newProfile: ExtendedProfile;
}

type SetUserProfileApiRequestType = IPostApiRequestType<
  ISetProfileParams,
  "Authorization",
  never,
  BasicResponseType<Profile>
>;

const setUserProfileHeaders = composeHeaderProducers(
  new AuthorizationBearerHeaderProducer<ISetProfileParams>(),
  ApiHeaderJson
);

const setUserProfileRequestType: SetUserProfileApiRequestType = {
  method: "post",
  url: "/api/v1/profile",
  headers: setUserProfileHeaders,
  query: _ => ({}),
  body: p => JSON.stringify(p.newProfile),
  response_decoder: basicResponseDecoder(Profile)
};

export const setUserProfile = createFetchRequestForApi(
  setUserProfileRequestType
);
