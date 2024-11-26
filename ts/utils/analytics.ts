import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import {
  isLoginUtilsError,
  LoginUtilsError
} from "@pagopa/io-react-native-login-utils";
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

export type FlowType =
  | "firstOnboarding"
  | "onBoarding"
  | "preferenze"
  | "browsing";

/**
 *
 * @param isOnBoarding existing user making new login
 * @param isFirstOnBoarding new user making new login
 * @param isUserBrowsing user navigating the app after firstOnboarding/onboarding
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

export const booleanToYesNo = (value: boolean): "yes" | "no" =>
  pipe(
    value,
    B.fold(
      () => "no" as const,
      () => "yes" as const
    )
  );

export const numberToYesNoOnThreshold = (
  value: number,
  threshold: number = 0
) =>
  pipe(
    value > threshold,
    B.fold(
      () => "no" as const,
      () => "yes" as const
    )
  );

export const buildEventProperties = (
  eventCategory: "KO" | "TECH" | "UX",
  eventType:
    | "action"
    | "control"
    | "exit"
    | "micro_action"
    | "screen_view"
    | "confirm"
    | "error"
    | undefined,
  customProperties: Record<string, unknown> = {},
  flow?: FlowType
) => ({
  event_category: eventCategory,
  event_type: eventType,
  flow,
  ...customProperties
});

// Lollipop events
export function trackLollipopKeyGenerationSuccess(keyType?: string) {
  void mixpanelTrack("LOLLIPOP_KEY_GENERATION_SUCCESS", {
    kty: keyType
  });
}

export function trackLollipopKeyGenerationFailure(reason: string) {
  void mixpanelTrack("LOLLIPOP_KEY_GENERATION_FAILURE", {
    reason
  });
}

export function trackLollipopIdpLoginFailure(reason: string) {
  void mixpanelTrack("LOLLIPOP_IDP_LOGIN_FAILURE", {
    reason
  });
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

export function trackLollipopIsKeyStrongboxBackedFailure(reason: string) {
  void mixpanelTrack(
    "LOLLIPOP_IS_KEY_STRONGBOX_BACKED_FAILURE",
    buildEventProperties("KO", undefined, {
      reason
    })
  );
}

// End of lollipop events

// SPID Login
export function trackSpidLoginError(
  idpName: string | undefined,
  e: Error | LoginUtilsError | WebViewErrorEvent | WebViewHttpErrorEvent
) {
  const eventName = "SPID_ERROR";
  if (isLoginUtilsError(e)) {
    void mixpanelTrack(eventName, {
      idp: idpName,
      code: e.userInfo?.statusCode,
      description: e.userInfo?.error,
      domain: e.userInfo?.url
    });
  } else {
    const error = e as Error;
    const webViewError = e as WebViewErrorEvent;
    const webViewHttpError = e as WebViewHttpErrorEvent;
    if (webViewHttpError.nativeEvent.statusCode) {
      const { description, statusCode, url } = webViewHttpError.nativeEvent;
      void mixpanelTrack(eventName, {
        idp: idpName,
        code: statusCode,
        description,
        domain: toUrlWithoutQueryParams(url)
      });
    } else if (webViewError.nativeEvent) {
      const { code, description, domain } = webViewError.nativeEvent;
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
// End of SPID Login

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

function toUrlWithoutQueryParams(url: string) {
  const urlAsURL = URLParse(url);
  return urlAsURL.origin + urlAsURL.pathname;
}
