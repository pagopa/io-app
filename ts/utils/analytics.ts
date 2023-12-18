import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import { LoginUtilsError } from "@pagopa/io-react-native-login-utils";
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent
} from "react-native-webview/lib/WebViewTypes";
import URLParse from "url-parse";
import EUCOVIDCERT_ROUTES from "../features/euCovidCert/navigation/routes";
import { euCovidCertificateEnabled } from "../config";
import { PushNotificationsContentTypeEnum } from "../../definitions/backend/PushNotificationsContentType";
import { mixpanelTrack } from "../mixpanel";
import { ReminderStatusEnum } from "../../definitions/backend/ReminderStatus";
import { isLoginUtilsError } from "../features/lollipop/utils/login";
import { ServicesDetailLoadTrack } from "../sagas/startup/loadServiceDetailRequestHandler";

const blackListRoutes: ReadonlyArray<string> = [];

// the routes contained in this set won't be tracked in SCREEN_CHANGE_V2 event
export const noAnalyticsRoutes = new Set<string>(
  // eslint-disable-next-line sonarjs/no-empty-collection
  blackListRoutes.concat(
    euCovidCertificateEnabled ? Object.values(EUCOVIDCERT_ROUTES) : []
  )
);

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
  ...customProperties,
  flow
});

// Notifications related events

export function trackNotificationInstallationTokenNotChanged() {
  void mixpanelTrack("NOTIFICATIONS_INSTALLATION_TOKEN_NOT_CHANGED");
}

export function trackNotificationsOptInPreviewStatus(
  contentType: PushNotificationsContentTypeEnum
) {
  void mixpanelTrack(
    "NOTIFICATIONS_OPTIN_PREVIEW_STATUS",
    buildEventProperties("UX", "action", {
      enabled: contentType === PushNotificationsContentTypeEnum.FULL
    })
  );
}

export function trackNotificationsOptInReminderStatus(
  reminderStatus: ReminderStatusEnum
) {
  void mixpanelTrack(
    "NOTIFICATIONS_OPTIN_REMINDER_STATUS",
    buildEventProperties("UX", "action", {
      enabled: reminderStatus === ReminderStatusEnum.ENABLED
    })
  );
}

export function trackNotificationsOptInReminderOnPermissionsOff() {
  void mixpanelTrack(
    "NOTIFICATIONS_OPTIN_REMINDER_ON_PERMISSIONS_OFF",
    buildEventProperties("UX", "control")
  );
}

export function trackNotificationsOptInOpenSettings() {
  void mixpanelTrack(
    "NOTIFICATIONS_OPTIN_OPEN_SETTINGS",
    buildEventProperties("UX", "action")
  );
}

export function trackNotificationsOptInSkipSystemPermissions() {
  void mixpanelTrack(
    "NOTIFICATIONS_OPTIN_SKIP_SYSTEM_PERMISSIONS",
    buildEventProperties("UX", "action")
  );
}

// End of Notifications related events

// Services related events

export function trackServiceDetailLoadingStatistics(
  trackingStats: ServicesDetailLoadTrack
) {
  void mixpanelTrack("SERVICES_DETAIL_LOADING_STATS", {
    ...trackingStats,
    // drop servicesId since it is not serialized in mixpanel and it could be an extra overhead on sending
    servicesId: undefined
  });
}

// End of Services related events

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
      code: e.userInfo.StatusCode,
      description: e.userInfo.Error,
      domain: e.userInfo.URL
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
export function trackKeychainGetFailure(reason: string | undefined) {
  if (reason) {
    void mixpanelTrack("KEY_CHAIN_GET_GENERIC_PASSWORD_FAILURE", {
      reason
    });
  }
}

function toUrlWithoutQueryParams(url: string) {
  const urlAsURL = URLParse(url);
  return urlAsURL.origin + urlAsURL.pathname;
}
