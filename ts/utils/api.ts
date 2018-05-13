/**
 * Implements the APIs to interact with the backend.
 */

import * as t from "io-ts";

import { ExtendedProfile } from "../../definitions/backend/ExtendedProfile";
import { Profile } from "../../definitions/backend/Profile";

import {
  ApiHeaderJson,
  composeHeaderProducers,
  createFetchRequestForApi,
  IGetApiRequestType,
  IPostApiRequestType,
  RequestHeaderProducer,
  RequestHeaders,
  ResponseType
} from "./api_request";

type BasicResponseType<R> =
  | ResponseType<200, R>
  | ResponseType<500 | 404, Error>;

function basicResponseDecoder<R>(
  type: t.Type<R>
): (response: Response) => Promise<BasicResponseType<R> | undefined> {
  return async (response: Response) => {
    if (response.status === 200) {
      const json = await response.json();
      const validated = type.decode(json);
      if (validated.isRight()) {
        return { status: 200, value: validated.value };
      }
    } else if (response.status === 500 || response.status === 404) {
      return { status: response.status, value: new Error(response.statusText) };
    }
    return undefined;
  };
}

interface IBaseApiParams {
  apiUrlPrefix: string;
  token: string;
}

class AuthorizationHeaderProducer<P extends { token: string }>
  implements RequestHeaderProducer<P, "Authorization"> {
  public apply(p: P): RequestHeaders<"Authorization"> {
    return {
      Authorization: `Bearer ${p.token}`
    };
  }
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
  headers: new AuthorizationHeaderProducer<IBaseApiParams>(),
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
  new AuthorizationHeaderProducer<ISetProfileParams>(),
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
