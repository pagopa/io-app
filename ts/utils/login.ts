import { WebViewNavigation } from "react-native-webview/lib/WebViewTypes";
import URLParse from "url-parse";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { SessionToken } from "../types/SessionToken";
import { trackLoginSpidError } from "../features/identification/common/analytics/spidAnalytics";
import { apiUrlPrefix, spidRelayState } from "../config";
import { IdpData } from "../../definitions/content/IdpData";
import { isStringNullyOrEmpty } from "./strings";
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
  errorMessage?: string;
};

type LoginResult = LoginSuccess | LoginFailure;

export const getEitherLoginResult = (
  result: LoginResult
): E.Either<LoginFailure, LoginSuccess> =>
  result.success ? E.right(result) : E.left(result);

/**
 * return some(intentFallbackUrl) if the given input is a valid intent and it has the fallback url
 * more info https://developer.chrome.com/docs/multidevice/android/intents/
 * @param intentUrl
 */
export const getIntentFallbackUrl = (intentUrl: string): O.Option<string> => {
  const intentProtocol = URLParse.extractProtocol(intentUrl);
  if (intentProtocol.protocol !== "intent:" || !intentProtocol.slashes) {
    return O.none;
  }
  const hook = "S.browser_fallback_url=";
  const hookIndex = intentUrl.indexOf(hook);
  const endIndex = intentUrl.indexOf(";end", hookIndex + hook.length);
  if (hookIndex !== -1 && endIndex !== -1) {
    return O.some(intentUrl.substring(hookIndex + hook.length, endIndex));
  }
  return O.none;
};

// Prefixes for LOGIN SUCCESS/ERROR
const LOGIN_SUCCESS_PAGE = "profile.html";
const LOGIN_FAILURE_PAGE = "error.html";

export const extractLoginResult = (
  url: string,
  idp?: keyof IdpData
): LoginResult | undefined => {
  const urlParse = new URLParse(url, true);

  // LOGIN_SUCCESS
  if (urlParse.pathname.includes(LOGIN_SUCCESS_PAGE)) {
    const token = urlParse.query.token;
    if (!isStringNullyOrEmpty(token)) {
      return { success: true, token: token as SessionToken };
    }
    return { success: false };
  }
  // LOGIN_FAILURE
  if (urlParse.pathname.includes(LOGIN_FAILURE_PAGE)) {
    const errorCode = urlParse.query.errorCode;
    const errorMessage = urlParse.query.errorMessage;
    // TODO: move the error tracking in the `AuthErrorScreen` & properly type `idp`
    if (idp !== "cie" && idp !== "cieid") {
      trackLoginSpidError(errorCode, {
        idp: idp || "not_set",
        ...(errorMessage ? { "error message": errorMessage } : {})
      });
    }
    return {
      success: false,
      errorCode: isStringNullyOrEmpty(errorCode) ? undefined : errorCode,
      errorMessage: isStringNullyOrEmpty(errorMessage)
        ? undefined
        : errorMessage
    };
  }
  // Url is not LOGIN related
  return undefined;
};

/** for a given idp id get the relative login uri */
export const getIdpLoginUri = (idpId: string, level: number) =>
  `${apiUrlPrefix}/login?authLevel=SpidL${level}&entityID=${idpId}&RelayState=${spidRelayState}`;

/**
 * Extract the login result from the given url.
 * Return true if the url contains login pattern & token
 */
export const onLoginUriChanged =
  (
    onFailure: (errorCode?: string, errorMessage?: string) => void,
    onSuccess: (_: SessionToken) => void,
    idp?: keyof IdpData
  ) =>
  (navState: WebViewNavigation): boolean => {
    if (navState.url) {
      // If the url is not related to login this will be `null`
      const loginResult = extractLoginResult(navState.url, idp);
      if (loginResult) {
        if (loginResult.success) {
          // In case of successful login
          onSuccess(loginResult.token);
          return true;
        } else {
          // In case of login failure
          onFailure(loginResult.errorCode, loginResult.errorMessage);
        }
      }
    }
    return false;
  };
