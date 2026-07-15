import {
  isLoginUtilsError,
  LoginUtilsError
} from "@pagopa/io-react-native-login-utils";
import * as B from "fp-ts/lib/boolean";
import { pipe } from "fp-ts/lib/function";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent
} from "react-native-webview/lib/WebViewTypes";
import URLParse from "url-parse";

import { mixpanelTrack } from "../mixpanel";
import {
  clearKeychainError,
  getKeychainError,
  removeKeychainError,
  setKeychainError
} from "../store/storages/keychain";

const isWebViewErrorEvent = (
  e: Parameters<typeof trackSpidLoginError>[1]
): e is WebViewErrorEvent => "nativeEvent" in e && e.nativeEvent != null;
const isWebViewHttpErrorEvent = (
  e: Parameters<typeof trackSpidLoginError>[1]
): e is WebViewHttpErrorEvent =>
  isWebViewErrorEvent(e) &&
  "statusCode" in e.nativeEvent &&
  e.nativeEvent.statusCode !== undefined;

export type FlowType =
  | "browsing"
  | "firstOnboarding"
  | "onBoarding"
  | "preferenze";

/**
 * @param isOnBoarding Existing user making new login
 * @param isFirstOnBoarding New user making new login
 * @param isUserBrowsing User navigating the app after
 *   firstOnboarding/onboarding
 * @returns
 */
export const getFlowType = (
  isOnBoarding: boolean,
  isFirstOnBoarding?: boolean,
  isUserBrowsing?: boolean
): FlowType => {
  if (isFirstOnBoarding) {
    return "firstOnboarding";
  }
  if (isOnBoarding) {
    return "onBoarding";
  }
  if (isUserBrowsing) {
    return "browsing";
  }
  return "preferenze";
};

export const booleanToYesNo = (value: boolean): "no" | "yes" =>
  pipe(
    value,
    B.fold(
      () => "no" as const,
      () => "yes" as const
    )
  );

export const numberToYesNoOnThreshold = (value: number, threshold = 0) =>
  pipe(
    value > threshold,
    B.fold(
      () => "no" as const,
      () => "yes" as const
    )
  );

export const dateToUTCISOString = (date: Date) => date.toISOString();

export const buildEventProperties = (
  eventCategory: "KO" | "TECH" | "UX",
  eventType:
    | "action"
    | "confirm"
    | "control"
    | "error"
    | "exit"
    | "micro_action"
    | "screen_view"
    | undefined,
  customProperties: Record<string, unknown> = {},
  flow?: FlowType
) => ({
  event_category: eventCategory,
  event_type: eventType,
  flow,
  ...customProperties
});

export const trackAppCaughtError = (
  subject: string,
  message: string | undefined,
  exception: string | undefined
) => {
  const eventName = "APP_CAUGHT_ERROR";
  const properties = buildEventProperties("TECH", undefined, {
    subject,
    message,
    exception
  });
  void mixpanelTrack(eventName, properties);
};

/**
 * Track the event when the user taps on the [Help Center
 * CTA](https://www.figma.com/design/BDwCywRh6ibbfuvfq8DavO?node-id=12490-33561#1130270800)
 *
 * @param hc_id - The contextual ID of the CTA (ex: SESSION_EXPIRED)
 * @param hc_landing_url - The URL where we navigate the user
 * @param hc_source - The route name where the CTA is (ex:
 *   AUTHENTICATION_LANDING)
 */
export function trackHelpCenterCtaTapped(
  hc_id?: string,
  hc_landing_url?: string,
  hc_source?: string
) {
  void mixpanelTrack(
    "HC_CTA_TAPPED",
    buildEventProperties("UX", "action", { hc_id, hc_landing_url, hc_source })
  );
}

// Keychain
// workaround to send keychainError for Pixel devices
// TODO: REMOVE AFTER FIXING https://pagopa.atlassian.net/jira/software/c/projects/IABT/boards/92?modal=detail&selectedIssue=IABT-1441
export function trackKeychainFailures() {
  if (getKeychainError) {
    void mixpanelTrack("KEY_CHAIN_GET_GENERIC_PASSWORD_FAILURE", {
      reason: getKeychainError,
      ...buildEventProperties("TECH", undefined)
    });
  }
  if (setKeychainError) {
    void mixpanelTrack("KEY_CHAIN_SET_GENERIC_PASSWORD_FAILURE", {
      reason: setKeychainError,
      ...buildEventProperties("TECH", undefined)
    });
  }
  if (removeKeychainError) {
    void mixpanelTrack("KEY_CHAIN_REMOVE_GENERIC_PASSWORD_FAILURE", {
      reason: removeKeychainError,
      ...buildEventProperties("TECH", undefined)
    });
  }
  clearKeychainError();
}

export function trackLollipopIdpLoginFailure(reason: string) {
  void mixpanelTrack("LOLLIPOP_IDP_LOGIN_FAILURE", {
    reason
  });
}

export function trackLollipopIsKeyStrongboxBackedFailure(reason: string) {
  void mixpanelTrack(
    "LOLLIPOP_IS_KEY_STRONGBOX_BACKED_FAILURE",
    buildEventProperties("KO", undefined, {
      reason
    })
  );
}

export function trackLollipopIsKeyStrongboxBackedSuccess(
  isStrongboxBacked: boolean
) {
  void mixpanelTrack(
    "LOLLIPOP_IS_KEY_STRONGBOX_BACKED_SUCCESS",
    buildEventProperties("TECH", undefined, {
      isStrongboxBacked
    })
  );
}

// End of lollipop events

export function trackLollipopKeyGenerationFailure(reason: string) {
  void mixpanelTrack("LOLLIPOP_KEY_GENERATION_FAILURE", {
    reason
  });
}
// End of SPID Login

// Lollipop events
export function trackLollipopKeyGenerationSuccess(keyType?: string) {
  void mixpanelTrack("LOLLIPOP_KEY_GENERATION_SUCCESS", {
    kty: keyType
  });
}

// SPID Login
export function trackSpidLoginError(
  idpName: string | undefined,
  error: Error | LoginUtilsError | WebViewErrorEvent | WebViewHttpErrorEvent
) {
  const eventName = "SPID_ERROR";
  if (isLoginUtilsError(error)) {
    void mixpanelTrack(eventName, {
      idp: idpName,
      code: error.userInfo?.statusCode,
      description: error.userInfo?.error,
      domain: error.userInfo?.url
    });
  } else {
    if (isWebViewHttpErrorEvent(error)) {
      const { description, statusCode, url } = error.nativeEvent;
      void mixpanelTrack(eventName, {
        idp: idpName,
        code: statusCode,
        description,
        domain: toUrlWithoutQueryParams(url)
      });
    } else if (isWebViewErrorEvent(error)) {
      const { code, description, domain } = error.nativeEvent;
      void mixpanelTrack(eventName, {
        idp: idpName,
        code,
        description,
        domain
      });
    } else if (error.message !== undefined) {
      void mixpanelTrack(eventName, {
        idp: idpName,
        code: error.message,
        description: error.message,
        domain: error.message
      });
    }
  }
}

// #region Help Center

function toUrlWithoutQueryParams(url: string) {
  const urlAsURL = URLParse(url);
  return urlAsURL.origin + urlAsURL.pathname;
}

// #endregion

// #region Offline

/**
 * Track the event when the user tries to perform an action that is not
 * available offline
 *
 * @param screen - The screen where the user tried to perform the action
 */
export const trackOfflineActionNotAllowed = (screen: string) => {
  void mixpanelTrack(
    "OFFLINE_ACTION_NOT_ALLOWED",
    buildEventProperties("KO", "error", { screen })
  );
};

/**
 * Track the event when the user tries to access a content that is not available
 * offline
 *
 * @param content - The screen where the user tried to access the content
 */
export const trackContentNotAvailable = (content: string) => {
  void mixpanelTrack(
    "OFFLINE_CONTENT_NOT_AVAILABLE",
    buildEventProperties("KO", "error", { content })
  );
};

// #endregion
