/** A failed login, as reported by the login WebViews. */
export type LoginFailure =
  | {
      payload: { code: number; description: string; url: string };
      type: "WEBVIEW_ERROR";
    }
  | {
      payload: { code?: string; message?: string };
      type: "LOGIN_FAILURE";
    }
  | {
      payload: { reason: string };
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
  type: LoginFailure["type"];
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
    case "LOGIN_FAILURE": {
      const { code, message } = failure.payload;
      return { type: failure.type, code, ...(message && { message }) };
    }
    case "ONE_IDENTITY_LOGIN_FAILURE":
      return { type: failure.type, message: failure.payload.reason };
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
