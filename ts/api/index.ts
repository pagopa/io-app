/**
 * This file collects all the functions/types required to interact with the
 * Proxy API.
 */

import { apiUrlPrefix } from "../config";

export type ApiFetchSuccess<T> = {
  isError: false;
  result: T;
};

export type ApiFetchFailure = {
  isError: true;
  error: Error;
};

export type ApiFetchResult<T> = ApiFetchSuccess<T> | ApiFetchFailure;

export function isApiFetchFailure<T>(
  r: ApiFetchResult<T>
): r is ApiFetchFailure {
  return r.isError;
}

// Utility type to add a required version property
export type Versionable = {
  version: number;
};

/**
 * A type that makes all fields of type T optional, then adds `version` as the
 * only
 * required field. This type is used mostly to update an API entity.
 */
export type WithOnlyVersionRequired<T> = Partial<T> & Versionable;

// A type to store all the properties of the user Profile
export type ApiProfile = {
  is_inbox_enabled: boolean;
} & Versionable;

// Fetch the profile from the Proxy
export const fetchProfile = async (
  token: string
): Promise<ApiFetchResult<ApiProfile>> => {
  const response = await fetch(`${apiUrlPrefix}/api/v1/profile`, {
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  if (response.ok) {
    const profile = await response.json();
    return { isError: false, result: profile };
  } else {
    return { isError: true, error: new Error("Error fetching profile") };
  }
};

// Send a new version of the profile to the Proxy
export const postProfile = async (
  token: string,
  newProfile: WithOnlyVersionRequired<ApiProfile>
): Promise<ApiFetchResult<ApiProfile>> => {
  const response = await fetch(`${apiUrlPrefix}/api/v1/profile`, {
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newProfile)
  });
  if (response.ok) {
    const profile = await response.json();
    return { isError: false, result: profile };
  } else {
    return { isError: true, error: new Error("Error posting profile") };
  }
};
