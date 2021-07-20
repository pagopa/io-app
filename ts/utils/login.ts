import { WebViewNavigation } from "react-native-webview/lib/WebViewTypes";
import URLParse from "url-parse";
import { fromPredicate, none, Option, some } from "fp-ts/lib/Option";
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

export const isPosteIDP = (idp: string): boolean => idp === "posteid";
export const isIntentScheme = (url: string): boolean =>
  new URLParse(url, true).protocol === "intent:";
export const extractFallback = (intent: string): Option<string> => {
  const hook = "S.browser_fallback_url=";
  const hookIndex = intent.indexOf(hook);
  if (hookIndex !== -1) {
    const endIndex = intent.lastIndexOf(";end");
    if (endIndex !== -1) {
      return some(intent.substring(hookIndex + hook.length, endIndex));
    }
  }
  return none;
};

export const getPosteIntent = (idp: string, url: string): Option<string> => {
  console.log(url);
  console.log("isPosteIDP", isPosteIDP(idp));
  console.log("isIntentScheme", new URLParse(url, true).protocol);
  if (!isPosteIDP(idp)) {
    return none;
  }
  return fromPredicate<string>(value => isIntentScheme(value))(url).chain(
    extractFallback
  );
};

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
) => (navState: WebViewNavigation): boolean => {
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
