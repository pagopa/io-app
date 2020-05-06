import { NavState } from "react-native";
import * as config from "../config";
import { SessionToken } from "../types/SessionToken";
/**
 * Helper functions for handling the SPID login flow through a webview.
 */

type LoginSuccess = {
  success: true;
  token: SessionToken;
};

type LoginFailure = {
  success: false;
  errorCode?: string;
};

type LoginResult = LoginSuccess | LoginFailure;

// Prefixes for LOGIN SUCCESS/ERROR
const LOGIN_SUCCESS_PREFIX = "/profile.html?token=";
const LOGIN_FAILURE_PREFIX = "/error.html";
const LOGIN_FAILURE_WITH_ERROR_CODE_PREFIX = "/error.html?errorCode=";

export const extractLoginResult = (url: string): LoginResult | undefined => {
  // Check for LOGIN_SUCCESS
  const successTokenPathPos = url.indexOf(LOGIN_SUCCESS_PREFIX);

  if (successTokenPathPos !== -1) {
    const token = url.substr(successTokenPathPos + LOGIN_SUCCESS_PREFIX.length);

    if (token && token.length > 0) {
      return { success: true, token: token as SessionToken };
    } else {
      return { success: false };
    }
  }

  // Check for LOGIN_FAILURE
  if (url.indexOf(LOGIN_FAILURE_PREFIX) !== -1) {
    const failureWithErrorCodeTokenPathPos = url.indexOf(
      LOGIN_FAILURE_WITH_ERROR_CODE_PREFIX
    );
    // try to extract error code
    if (failureWithErrorCodeTokenPathPos !== -1) {
      const errCode = url.substr(
        failureWithErrorCodeTokenPathPos +
          LOGIN_FAILURE_WITH_ERROR_CODE_PREFIX.length
      );
      return {
        success: false,
        errorCode: errCode.length > 0 ? errCode : undefined
      };
    }
    return {
      success: false,
      errorCode: undefined
    };
  }
  // Url is not LOGIN related
  return undefined;
};

/** for a given idp id get the relative login uri */
export const getIdpLoginUri = (idpId: string) =>
  `${config.apiUrlPrefix}/login?authLevel=SpidL2&entityID=${idpId}`;

/**
 * Extract the login result from the given url.
 * Return true if the url contains login pattern & token
 */
export const onLoginUriChanged = (
  onFailure: (errorCode: string | undefined) => void,
  onSuccess: (_: SessionToken) => void
) => (navState: NavState): boolean => {
  if (navState.url) {
    // If the url is not related to login this will be `null`
    const loginResult = extractLoginResult(navState.url);
    if (loginResult) {
      if (loginResult.success) {
        // In case of successful login
        onSuccess(loginResult.token);
        return true;
      } else {
        // In case of login failure
        onFailure(loginResult.errorCode);
      }
    }
  }
  return false;
};
