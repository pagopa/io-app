/**
 * Implements the APIs to interact with the backend.
 */

import { fromEither } from "fp-ts/lib/Option";

import { ExtendedProfile } from "../../definitions/backend/ExtendedProfile";
import { Profile } from "../../definitions/backend/Profile";

import { getApi } from "./req";

import { FiscalCode } from "../../definitions/backend/FiscalCode";

export async function getProfile(): Promise<FiscalCode | undefined> {
  return getApi<FiscalCode>({
    method: "get",
    response_body_type: FiscalCode
  });
}

export async function getUserProfile(
  apiUrlPrefix: string,
  token: string
): Promise<Profile | undefined> {
  try {
    const response = await fetch(`${apiUrlPrefix}/api/v1/profile`, {
      method: "get",
      headers: { Authorization: `Bearer ${token}` }
    });
    const profileOrError = Profile.decode(await response.json());
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
  newProfile: ExtendedProfile
): Promise<Profile | number | undefined> {
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
