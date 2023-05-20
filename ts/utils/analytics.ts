import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { LoginUtilsError } from "@pagopa/io-react-native-login-utils";
import { WebViewErrorEvent } from "react-native-webview/lib/WebViewTypes";
import EUCOVIDCERT_ROUTES from "../features/euCovidCert/navigation/routes";
import { euCovidCertificateEnabled } from "../config";
import { PushNotificationsContentTypeEnum } from "../../definitions/backend/PushNotificationsContentType";
import { mixpanelTrack } from "../mixpanel";
import { ReminderStatusEnum } from "../../definitions/backend/ReminderStatus";
import { UIMessageId } from "../store/reducers/entities/messages/types";
import { ServiceId } from "../../definitions/backend/ServiceId";
import { isLoginUtilsError } from "../features/lollipop/utils/login";

const blackListRoutes: ReadonlyArray<string> = [];

// the routes contained in this set won't be tracked in SCREEN_CHANGE_V2 event
export const noAnalyticsRoutes = new Set<string>(
  // eslint-disable-next-line sonarjs/no-empty-collection
  blackListRoutes.concat(
    euCovidCertificateEnabled ? Object.values(EUCOVIDCERT_ROUTES) : []
  )
);

// Premium events

export function trackMessageNotificationTap(messageId: NonEmptyString) {
  void mixpanelTrack("NOTIFICATIONS_MESSAGE_TAP", {
    messageId
  });
}

export function trackNotificationsOptInPreviewStatus(
  contentType: PushNotificationsContentTypeEnum
) {
  void mixpanelTrack("NOTIFICATIONS_OPTIN_PREVIEW_STATUS", {
    enabled: contentType === PushNotificationsContentTypeEnum.FULL
  });
}

export function trackNotificationsOptInReminderStatus(
  reminderStatus: ReminderStatusEnum
) {
  void mixpanelTrack("NOTIFICATIONS_OPTIN_REMINDER_STATUS", {
    enabled: reminderStatus === ReminderStatusEnum.ENABLED
  });
}

export function trackConflictingNotificationSettings() {
  void mixpanelTrack("NOTIFICATIONS_OPTIN_REMINDER_ON_PERMISSIONS_OFF");
}

export function trackOpenSystemNotificationSettings() {
  void mixpanelTrack("NOTIFICATIONS_OPTIN_OPEN_SETTINGS");
}

export function trackSkipSystemNotificationPermissions() {
  void mixpanelTrack("NOTIFICATIONS_OPTIN_SKIP_SYSTEM_PERMISSIONS");
}

export function trackNotificationsPreferencesPreviewStatus(enabled: boolean) {
  void mixpanelTrack("NOTIFICATIONS_PREFERENCES_PREVIEW_STATUS", {
    enabled
  });
}

export function trackNotificationsPreferencesReminderStatus(enabled: boolean) {
  void mixpanelTrack("NOTIFICATIONS_PREFERENCES_REMINDER_STATUS", {
    enabled
  });
}

export function trackThirdPartyMessageAttachmentCount(attachmentCount: number) {
  void mixpanelTrack("THIRD_PARTY_MESSAGE_ATTACHMENT_COUNT", {
    attachmentCount
  });
}

export function trackThirdPartyMessageAttachmentUnavailable(
  messageId: UIMessageId,
  serviceId: ServiceId | undefined
) {
  void mixpanelTrack("THIRD_PARTY_MESSAGE_ATTACHMENT_UNAVAILABLE", {
    messageId,
    serviceId: serviceId ?? ""
  });
}

export function trackThirdPartyMessageAttachmentDownloadFailed(
  messageId: UIMessageId,
  serviceId: ServiceId | undefined
) {
  void mixpanelTrack("THIRD_PARTY_MESSAGE_ATTACHMENT_DOWNLOAD_FAILED", {
    messageId,
    serviceId: serviceId ?? ""
  });
}

export function trackThirdPartyMessageAttachmentBadFormat(
  messageId: UIMessageId,
  serviceId: ServiceId | undefined
) {
  void mixpanelTrack("THIRD_PARTY_MESSAGE_ATTACHMENT_BAD_FORMAT", {
    messageId,
    serviceId: serviceId ?? ""
  });
}

export function trackThirdPartyMessageAttachmentCorruptedFile(
  messageId: UIMessageId,
  serviceId: ServiceId | undefined
) {
  void mixpanelTrack("THIRD_PARTY_MESSAGE_ATTACHMENT_CORRUPTED_FILE", {
    messageId,
    serviceId: serviceId ?? ""
  });
}

export function trackThirdPartyMessageAttachmentPreviewSuccess() {
  void mixpanelTrack("THIRD_PARTY_MESSAGE_ATTACHMENT_PREVIEW_SUCCESS");
}

export function trackThirdPartyMessageAttachmentShowPreview() {
  void mixpanelTrack("THIRD_PARTY_MESSAGE_ATTACHMENT_SHOW_PREVIEW");
}

export function trackThirdPartyMessageAttachmentDoNotShow() {
  void mixpanelTrack("THIRD_PARTY_MESSAGE_ATTACHMENT_DO_NOT_SHOW");
}

type ThirdPartyMessageAttachmentUserAction = "download" | "open" | "share";
export function trackThirdPartyMessageAttachmentUserAction(
  userAction: ThirdPartyMessageAttachmentUserAction
) {
  void mixpanelTrack("THIRD_PARTY_MESSAGE_ATTACHMENT_USER_ACTION", {
    userAction
  });
}

// End of premium events

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
  e: Error | LoginUtilsError | WebViewErrorEvent
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
    if (webViewError.nativeEvent) {
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
