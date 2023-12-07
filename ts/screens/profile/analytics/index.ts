import { ServicesPreferencesModeEnum } from "../../../../definitions/backend/ServicesPreferencesMode";
import { mixpanelTrack } from "../../../mixpanel";
import { FlowType, buildEventProperties } from "../../../utils/analytics";

export function trackTosScreen(flow: FlowType) {
  void mixpanelTrack(
    "TOS",
    buildEventProperties("UX", "screen_view", undefined, flow)
  );
}

export function trackMixpanelScreen(flow: FlowType) {
  void mixpanelTrack(
    "TRACKING",
    buildEventProperties("UX", "screen_view", undefined, flow)
  );
}

export function trackPinScreen(flow: FlowType) {
  void mixpanelTrack(
    "PIN_CREATION",
    buildEventProperties("UX", "screen_view", undefined, flow)
  );
}

export function trackNotificationScreen(flow: FlowType) {
  void mixpanelTrack(
    "NOTIFICATION_PREFERENCE",
    buildEventProperties("UX", "screen_view", undefined, flow)
  );
}

export function trackServiceConfigurationScreen(flow: FlowType) {
  void mixpanelTrack(
    "SERVICE_PREFERENCE",
    buildEventProperties("UX", "screen_view", undefined, flow)
  );
}

export function trackThankYouPageScreen() {
  void mixpanelTrack("LOGIN_TYP", buildEventProperties("UX", "screen_view"));
}

export function trackPinError(error: "creation" | "confirm", flow: FlowType) {
  void mixpanelTrack(
    "PIN_CREATION_ERROR",
    buildEventProperties("UX", "error", { error }, flow)
  );
}

export function trackCreatePinSuccess(flow: FlowType) {
  void mixpanelTrack(
    "CREATE_PIN_SUCCESS",
    buildEventProperties("UX", "action", undefined, flow)
  );
}

export function trackTosAccepted(acceptedTosVersion: number, flow: FlowType) {
  void mixpanelTrack(
    "TOS_ACCEPTED",
    buildEventProperties(
      "UX",
      "action",
      {
        acceptedTosVersion
      },
      flow
    )
  );
}

export function trackNotificationsPreferencesPreviewStatus(
  enabled: boolean,
  flow: FlowType
) {
  void mixpanelTrack(
    "NOTIFICATIONS_PREFERENCES_PREVIEW_STATUS",
    buildEventProperties(
      "UX",
      "action",
      {
        enabled
      },
      flow
    )
  );
}

export function trackNotificationsPreferencesReminderStatus(
  enabled: boolean,
  flow: FlowType
) {
  void mixpanelTrack(
    "NOTIFICATIONS_PREFERENCES_REMINDER_STATUS",
    buildEventProperties(
      "UX",
      "action",
      {
        enabled
      },
      flow
    )
  );
}

export function trackServiceConfiguration(
  mode: ServicesPreferencesModeEnum | undefined,
  flow: FlowType
) {
  void mixpanelTrack(
    "SERVICE_PREFERENCE_CONFIGURATION",
    buildEventProperties(
      "UX",
      "action",
      {
        mode
      },
      flow
    )
  );
}

type NotificationPreferenceConfiguration =
  | "preview"
  | "reminder"
  | "none"
  | "complete";

function getNotificationPreferenceConfiguration(
  isReminderEnabled: boolean,
  isPreviewEnabled: boolean
): NotificationPreferenceConfiguration {
  if (isReminderEnabled && isPreviewEnabled) {
    return "complete";
  }
  if (isReminderEnabled) {
    return "reminder";
  }
  if (isPreviewEnabled) {
    return "preview";
  }
  return "none";
}

export function trackNotificationPreferenceConfiguration(
  isReminderEnabled: boolean,
  isPreviewEnabled: boolean,
  flow: FlowType
) {
  const configuration: NotificationPreferenceConfiguration =
    getNotificationPreferenceConfiguration(isReminderEnabled, isPreviewEnabled);
  void mixpanelTrack(
    "NOTIFICATION_PREFERENCE_CONFIGURATION",
    buildEventProperties(
      "UX",
      "action",
      {
        configuration
      },
      flow
    )
  );
}
