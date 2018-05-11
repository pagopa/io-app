/**
 * Implements the APIs to interact with the backend.
 */

import { ExtendedProfile } from "../../definitions/backend/ExtendedProfile";
import { Profile } from "../../definitions/backend/Profile";

import { createApiCall } from "./api_request";

interface IBaseApiParams {
  apiUrlPrefix: string;
  token: string;
}

export const getUserProfile = createApiCall({
  method: "get",
  url: (p: IBaseApiParams) => `${p.apiUrlPrefix}/api/v1/profile`,
  headers: (p: IBaseApiParams) => ({
    Authorization: `Bearer ${p.token}`
  }),
  response_type: Profile
});

interface ISetProfileParams extends IBaseApiParams {
  newProfile: ExtendedProfile;
}

export const setUserProfile = createApiCall({
  method: "post",
  url: (p: ISetProfileParams) => `${p.apiUrlPrefix}/api/v1/profile`,
  headers: (p: ISetProfileParams) => ({
    Authorization: `Bearer ${p.token}`
  }),
  body: (p: ISetProfileParams) => JSON.stringify(p.newProfile),
  response_type: Profile
});

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
