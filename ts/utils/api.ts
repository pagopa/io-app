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
  apiUrlPrefix: string;
  token: string;
}

//
// GetUserProfile
//

type GetUserProfileRequestType = IGetApiRequestType<
  IBaseApiParams,
  "Authorization",
  BasicResponseType<Profile>
>;

const getUserProfileRequestType: GetUserProfileRequestType = {
  method: "get",
  url: p => `${p.apiUrlPrefix}/api/v1/profile`,
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
  BasicResponseType<Profile>
>;

const setUserProfileHeaders = composeHeaderProducers(
  new AuthorizationBearerHeaderProducer<ISetProfileParams>(),
  ApiHeaderJson
);

const setUserProfileRequestType: SetUserProfileApiRequestType = {
  method: "post",
  url: p => `${p.apiUrlPrefix}/api/v1/profile`,
  headers: setUserProfileHeaders,
  body: p => JSON.stringify(p.newProfile),
  response_decoder: basicResponseDecoder(Profile)
};

export const setUserProfile = createFetchRequestForApi(
  setUserProfileRequestType
);

//
// ----
//

/**
 * Describes a SPID Identity Provider
 */
export type IdentityProvider = {
  id: string;
  logo: any;
  name: string;
  entityID: string;
  profileUrl: string;
};

export function isDemoIdp(idp: IdentityProvider): boolean {
  return idp.id === "demo";
}
