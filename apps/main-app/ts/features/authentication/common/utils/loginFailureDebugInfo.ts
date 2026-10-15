import { OneIdentityLoginSourceError } from "../../../lollipop/hooks/useOneIdentityLoginSource";

/** A failed login, as reported by the login WebViews. */
export type LoginFailure =
  | {
      /** A page the WebView loaded, recognized as an error page by its title. */
      payload: { title: string; url: string };
      type: "ERROR_PAGE";
    }
  | {
      payload: { code: number; description: string; url: string };
      type: "WEBVIEW_ERROR";
    }
  | {
      payload: { code?: string; message?: string };
      type: "LOGIN_FAILURE";
    }
  | {
      payload: { error: OneIdentityLoginSourceError };
      type: "ONE_IDENTITY_LOGIN_FAILURE";
    }
  | {
      payload: { statusCode: number; url: string };
      type: "WEBVIEW_HTTP_ERROR";
    }
  | { type: "CANCEL" };

export type LoginFailureDebugInfo = {
  /**
   * The backend error code, the native WebView error code or the HTTP status
   * code, depending on `type`.
   */
  code?: number | string;
  message?: string;
  /**
   * The kind of failure. For a failure before reaching the IDP page, it's the
   * type of the OneIdentity login source error.
   */
  type: LoginFailure["type"] | OneIdentityLoginSourceError["type"];
  url?: string;
};

/**
 * Flattens a login failure into the fields shown in debug mode, so that every
 * login error screen exposes the same shape whatever the origin of the error
 * (backend, network or HTTP).
 */
export const getLoginFailureDebugInfo = (
  failure: LoginFailure
): LoginFailureDebugInfo => {
  switch (failure.type) {
    case "CANCEL":
      return { type: failure.type };
    case "ERROR_PAGE": {
      const { title, url } = failure.payload;
      return { type: failure.type, message: title, url };
    }
    case "LOGIN_FAILURE": {
      const { code, message } = failure.payload;
      return { type: failure.type, code, ...(message && { message }) };
    }
    case "ONE_IDENTITY_LOGIN_FAILURE":
      return { ...failure.payload.error };
    case "WEBVIEW_ERROR": {
      const { code, description, url } = failure.payload;
      return { type: failure.type, code, message: description, url };
    }
    case "WEBVIEW_HTTP_ERROR": {
      const { statusCode, url } = failure.payload;
      return { type: failure.type, code: statusCode, url };
    }
  }
};
