/**
 * This file collects all the functions/types required to interact with the
 * Proxy API.
 */

import { apiUrlPrefix } from "../config";

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

export type LoginSuccess = {
  success: true;
  token: string;
};

export type LoginFailure = {
  success: false;
};

export type LoginResult = LoginSuccess | LoginFailure;

// Prefixes for LOGIN SUCCESS/ERROR
const LOGIN_SUCCESS_PREFIX = "/profile.html?token=";
const LOGIN_FAILURE_PREFIX = "/error.html";

export const extractLoginResult = (url: string): LoginResult | undefined => {
  // Check for LOGIN_SUCCESS
  const successTokenPathPos = url.indexOf(LOGIN_SUCCESS_PREFIX);

  if (successTokenPathPos !== -1) {
    const token = url.substr(successTokenPathPos + LOGIN_SUCCESS_PREFIX.length);

    if (token && token.length > 0) {
      return { success: true, token };
    } else {
      return { success: false };
    }
  }

  // Check for LOGIN_FAILURE
  const failureTokenPathPos = url.indexOf(LOGIN_FAILURE_PREFIX);

  if (failureTokenPathPos !== -1) {
    return { success: false };
  }

  // Url is not LOGIN related
  return undefined;
};

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
