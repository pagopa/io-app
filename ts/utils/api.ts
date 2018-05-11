/**
 * Implements the APIs to interact with the backend.
 */

import { fromEither } from "fp-ts/lib/Option";

import { ExtendedProfile as ApiNewUserProfile } from "../../definitions/backend/ExtendedProfile";
import { Profile as ApiUserProfile } from "../../definitions/backend/Profile";

export async function getUserProfile(
  apiUrlPrefix: string,
  token: string
): Promise<ApiUserProfile | undefined> {
  try {
    const response = await fetch(`${apiUrlPrefix}/api/v1/profile`, {
      method: "get",
      headers: { Authorization: `Bearer ${token}` }
    });
    const profileOrError = ApiUserProfile.decode(await response.json());
    return fromEither(profileOrError).toUndefined();
  } catch (error) {
    return undefined;
    // TODO handle error
    // console.error(error)
  }
}

export async function setUserProfile(
  apiUrlPrefix: string,
  token: string,
  newProfile: ApiNewUserProfile
): Promise<ApiUserProfile | number | undefined> {
  try {
    const response = await fetch(`${apiUrlPrefix}/api/v1/profile`, {
      method: "post",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newProfile)
    });

    if (response.status === 500) {
      return response.status;
    } else {
      // TODO: use profile
      return await response.json();
    }
  } catch (error) {
    return undefined;
    // if the proxy is not reacheable
    // TODO handle unsuccessful fetch
    // @see https://www.pivotaltracker.com/story/show/154661120
  }
}

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
