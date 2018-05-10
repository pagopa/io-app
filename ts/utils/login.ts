/**
 * Utility method and types to extract the login result from the webview url
 */

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
