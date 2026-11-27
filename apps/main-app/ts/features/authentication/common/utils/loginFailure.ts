import { CieIdModuleErrorCodes } from "@pagopa/io-react-native-cieid";
import { Event as CieEvent } from "@pagopa/react-native-cie";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent
} from "react-native-webview/lib/WebViewTypes";

/**
 * An event of the CIE SDK. `"Function not supported"` is sent by the iOS SDK
 * but missing from its typings.
 */
export type CieSdkEvent = "Function not supported" | CieEvent["event"];

export type LoginFailure = {
  [K in LoginFailureKind]: { details: LoginFailureDetailsMap[K]; kind: K };
}[LoginFailureKind];

export const LOLLIPOP_FAILURE_REASONS = {
  CONVERSION_FAILED: "Unable to convert saml request from xml to json",
  DECODING_FAILED: "Unable to decode saml request",
  MISMATCH: "Mismatch between local and remote ID parameter content",
  MISSING_ID: "Missing ID parameter in AuthnRequest"
} as const;

export type LollipopFailureReason =
  (typeof LOLLIPOP_FAILURE_REASONS)[keyof typeof LOLLIPOP_FAILURE_REASONS];

export const NATIVE_REDIRECTS_FAILURE_REASONS = {
  MISSING_REDIRECTS: "Missing Redirects",
  MISSING_SAML_REQUEST: "Missing SAMLRequest parameter in URL"
} as const;

export const getWebViewFailure = ({
  nativeEvent
}: WebViewErrorEvent | WebViewHttpErrorEvent): LoginFailure =>
  "statusCode" in nativeEvent
    ? {
        kind: "webViewHttp",
        details: {
          description: nativeEvent.description,
          statusCode: nativeEvent.statusCode,
          url: nativeEvent.url
        }
      }
    : {
        kind: "webViewNative",
        details: {
          code: nativeEvent.code,
          description: nativeEvent.description,
          domain: nativeEvent.domain,
          url: nativeEvent.url
        }
      };

/**
 * The `reason` of a login failure, as sent to Mixpanel. It never holds a URL,
 * which may have a query string.
 */
export const getLoginFailureReason = (failure: LoginFailure): string => {
  switch (failure.kind) {
    case "backend":
      return describeCodeAndMessage("login failure", failure.details);
    case "cancelled":
      return "Login cancelled by the user";
    case "cieCard":
      return `cie card failure (${failure.details.event})`;
    case "cieErrorPage":
      return failure.details.title;
    case "cieIdApp":
      return describeCodeAndMessage("CieID app failure", failure.details);
    case "cieIdUrlNotAllowed":
      return "cieid url not allowed";
    case "idpAppNotOpened":
      return failure.details.code
        ? `idp app not opened (${failure.details.code})`
        : "idp app not opened";
    case "idpList":
    case "lollipop":
    case "nativeRedirects":
    case "reserve":
      return failure.details.reason;
    case "keyGeneration":
      return "Unable to generate ephemeral public key";
    case "oneIdentityErrorPage":
      return "oneidentity error page";
    case "webViewHttp":
      return `webview http error (${failure.details.statusCode})`;
    case "webViewNative":
      return `webview error (${failure.details.code})`;
  }
};

const describeCodeAndMessage = (
  prefix: string,
  { errorCode, errorMessage }: { errorCode?: string; errorMessage?: string }
): string => {
  if (errorCode && errorMessage) {
    return `${prefix} with code (${errorCode}) and message (${errorMessage})`;
  }
  if (errorCode) {
    return `${prefix} with code (${errorCode})`;
  }
  if (errorMessage) {
    return `${prefix} with message (${errorMessage})`;
  }
  return `${prefix} with no code or message`;
};

/**
 * The key of the `AuthErrorScreen` content: the error code, or else the
 * message, of a `backend` or `cieIdApp` failure.
 */
export const getAuthErrorKey = (failure: LoginFailure): string | undefined => {
  const { errorCode, errorMessage } =
    failure.kind === "cieIdApp" || failure.kind === "backend"
      ? failure.details
      : {};
  return errorCode || errorMessage;
};

type LoginFailureDetailsMap = {
  /** The Session Manager ended the flow without a token. */
  backend: {
    errorCode?: string;
    errorMessage?: string;
  };
  /** The user cancelled the login while it was loading (CieID). */
  cancelled: Record<string, never>;
  /** The CIE SDK reported an event that halts the card reading (CIE + PIN). */
  cieCard: {
    /** Sent by the SDK with every event; it matters for the PIN events. */
    attemptsLeft: number;
    event: CieSdkEvent;
  };
  /** A page of the CIE + PIN authentication step loaded with an error title. */
  cieErrorPage: { title: string; url: string };
  /** The CieID app returned an error. */
  cieIdApp: {
    /** The error code of the CieID SDK, on Android only. */
    errorCode?: CieIdModuleErrorCodes;
    /** The `cieid_error_message` of the return deep link, on iOS only. */
    errorMessage?: string;
  };
  /** The URL the CieID app returned to IO has an origin that is not allowed. */
  cieIdUrlNotAllowed: { url: string };
  /** The app of the IdP could not be opened: today only the CieID app, on iOS. */
  idpAppNotOpened: {
    /** The code of the `Linking.openURL` rejection (e.g. `EUNSPECIFIED`). */
    code?: string;
    url: string;
  };
  /** The IdP list could not be loaded. */
  idpList: { reason: string; url: string };
  /** The ephemeral Lollipop key could not be generated. */
  keyGeneration: Record<string, never>;
  /** The Lollipop check of the `SAMLRequest` failed. */
  lollipop: { reason: LollipopFailureReason; url: string };
  /** Following the `/authorize` redirects natively, outside the WebView, failed. */
  nativeRedirects: {
    reason: string;
    /**
     * The `/authorize` URL the redirects started from, or the last redirect
     * when it has no `SAMLRequest`.
     */
    url: string;
  };
  /**
   * A URL whose path contains `/login/error`, OneIdentity's error page. Not
   * produced yet: the flows only track it and let the page load.
   */
  oneIdentityErrorPage: { url: string };
  /** The `/reserve` request failed. */
  reserve: { reason: string; url: string };
  /** A page of the flow answered with an HTTP error. */
  webViewHttp: {
    /** The HTTP reason phrase (e.g. "Forbidden"): empty on iOS. */
    description: string;
    statusCode: number;
    url: string;
  };
  /** A page of the flow could not be loaded (network, SSL, ...). */
  webViewNative: {
    code: number;
    /** The error message: localized on iOS. */
    description: string;
    /** The error domain (e.g. `NSURLErrorDomain`). iOS only. */
    domain?: string;
    url: string;
  };
};

type LoginFailureKind = keyof LoginFailureDetailsMap;

// TODO: remove together with the IO login flow
/** The `backend` failure for an error code and message. */
export const getBackendFailure = (
  errorCode?: string,
  errorMessage?: string
): LoginFailure => ({ kind: "backend", details: { errorCode, errorMessage } });

// TODO: remove together with the IO login flow
/** Adapts a handler of an error code and message to a `LoginFailure`. */
export const withBackendCodeAndMessage =
  (handler: (errorCode?: string, errorMessage?: string) => void) =>
  (failure: LoginFailure) => {
    const { errorCode, errorMessage } =
      failure.kind === "backend" ? failure.details : {};
    handler(errorCode, errorMessage);
  };

// TODO: remove together with the IO login flow
/**
 * The strings the legacy CIE overlay (`CieRequestAuthenticationOverlay`) sends
 * to Mixpanel for these failures.
 */
export const toRedirectsFailureReason = (failure: LoginFailure): string =>
  failure.kind === "keyGeneration"
    ? "Missing publicKey"
    : getLoginFailureReason(failure);
