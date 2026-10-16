import { fakerIT as faker } from "@faker-js/faker";
import { Request } from "express";

import { ioDevServerConfig } from "../config";
import { oneIdentityCieIdpIds } from "../payloads/login";
import { AuthenticationProvider } from "../payloads/profile";
import { createOrRefreshSessionTokens } from "../payloads/session";
import { isFeatureFlagWithMinVersionEnabled } from "../routers/features/featureFlagUtils";
import { getDateMsDifference } from "../utils/date";

enum LoginEnum {
  fastLogin = "LV",
  standard = "STANDARD"
}

type LoginSessionTokenInfo = {
  authenticationProvider: AuthenticationProvider | undefined;
  instantiationDate: Date | undefined;
  loginSessionToken: string | undefined;
  loginType: LoginEnum | undefined;
};

const loginSessionTokenInfo: LoginSessionTokenInfo = {
  loginSessionToken: undefined,
  instantiationDate: undefined,
  loginType: undefined,
  authenticationProvider: undefined
};

export const getAuthenticationProvider = () =>
  loginSessionTokenInfo.authenticationProvider ?? "spid";

export const getLoginSessionToken = () =>
  loginSessionTokenInfo.loginSessionToken;

export const clearLoginSessionTokenInfo = () =>
  Object.keys(loginSessionTokenInfo).forEach(key => {
    // eslint-disable-next-line functional/immutable-data
    loginSessionTokenInfo[key as keyof LoginSessionTokenInfo] = undefined;
  });

const setLoginSessionToken = (newToken: string) => {
  // eslint-disable-next-line functional/immutable-data
  loginSessionTokenInfo.loginSessionToken = newToken;
  // eslint-disable-next-line functional/immutable-data
  loginSessionTokenInfo.instantiationDate = new Date();
};

const generateNewLoginToken = () => faker.string.alphanumeric(11).toUpperCase();

export const createOrRefreshEverySessionToken = () => {
  setLoginSessionToken(generateNewLoginToken());
  createOrRefreshSessionTokens();
  return loginSessionTokenInfo.loginSessionToken;
};

export const setSessionLoginType = (req: Request) => {
  // eslint-disable-next-line functional/immutable-data
  loginSessionTokenInfo.loginType = req.get("x-pagopa-login-type") as
    | LoginEnum
    | undefined;
};

/**
 * Sets the login type from the `login_type` of the OneIdentity `/reserve` body,
 * where anything but `LV` (i.e. `LEGACY`) is a standard login.
 */
export const setSessionLoginTypeFromReserve = (loginType: unknown) => {
  // eslint-disable-next-line functional/immutable-data
  loginSessionTokenInfo.loginType =
    loginType === LoginEnum.fastLogin
      ? LoginEnum.fastLogin
      : LoginEnum.standard;
};

export const setSessionAuthenticationProvider = (req: Request) => {
  const idpId = req.get("x-pagopa-idp-id") === "cie" ? "cie" : "spid";
  // eslint-disable-next-line functional/immutable-data
  loginSessionTokenInfo.authenticationProvider = idpId as
    | AuthenticationProvider
    | undefined;
};

/**
 * Sets the authentication provider from the `idp` of the OneIdentity
 * `/authorize` query, where anything but a CIE identity provider is SPID.
 */
export const setSessionAuthenticationProviderFromIdp = (idp: unknown) => {
  // eslint-disable-next-line functional/immutable-data
  loginSessionTokenInfo.authenticationProvider =
    typeof idp === "string" && oneIdentityCieIdpIds.includes(idp)
      ? "cie"
      : "spid";
};

export const isSessionTokenValid = (requestOrUndefined?: Request) => {
  if (requestOrUndefined) {
    const bearerToken = requestOrUndefined.get("authorization");

    // if there is no bearer token , we assume the call does not require verification
    if (!bearerToken) {
      return true;
    }
  }

  // if user is authenticated but this is not a fast login, the token in always ok
  if (loginSessionTokenInfo.loginType !== LoginEnum.fastLogin) {
    return true;
  }

  if (!isFeatureFlagWithMinVersionEnabled("fastLogin")) {
    return false;
  }

  if (!ioDevServerConfig.features.fastLogin) {
    return false;
  }

  // if loginSessionTokenInfo is not correctly defined, the user cannot be authenticated
  if (
    !loginSessionTokenInfo.instantiationDate ||
    !loginSessionTokenInfo.loginSessionToken
  ) {
    // eslint-disable-next-line no-console
    console.error("ERROR!!! Missing session info");
    return false;
  }

  // TODO: Add equality check between received and stored token
  // Jira: https://pagopa.atlassian.net/browse/IOPID-357

  return (
    getDateMsDifference(new Date(), loginSessionTokenInfo.instantiationDate) <
    ioDevServerConfig.features.fastLogin.sessionTTLinMS
  );
};
