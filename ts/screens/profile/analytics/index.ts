import { ServicesPreferencesModeEnum } from "../../../../definitions/backend/ServicesPreferencesMode";
import { mixpanelTrack } from "../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../mixpanelConfig/profileProperties";
import { updateMixpanelSuperProperties } from "../../../mixpanelConfig/superProperties";
import { profileLoadSuccess } from "../../../store/actions/profile";
import { GlobalState } from "../../../store/reducers/types";
import { FlowType, buildEventProperties } from "../../../utils/analytics";

export async function trackProfileLoadSuccess(state: GlobalState) {
  await updateMixpanelSuperProperties(state);
  await updateMixpanelProfileProperties(state);
  await mixpanelTrack(profileLoadSuccess.toString());
}

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

export async function trackTosAccepted(
  acceptedTosVersion: number,
  flow: FlowType,
  state: GlobalState
) {
  await updateMixpanelProfileProperties(state, {
    property: "TOS_ACCEPTED_VERSION",
    value: acceptedTosVersion
  });
  await mixpanelTrack(
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

export type ServiceConfigurationTrackingType =
  | ServicesPreferencesModeEnum
  | undefined
  | "not set";

export async function trackServiceConfiguration(
  mode: ServiceConfigurationTrackingType,
  flow: FlowType,
  state: GlobalState
) {
  await updateMixpanelProfileProperties(state, {
    property: "SERVICE_CONFIGURATION",
    value: mode
  });
  await updateMixpanelSuperProperties(state, {
    property: "SERVICE_CONFIGURATION",
    value: mode
  });
  await mixpanelTrack(
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

export type NotificationPreferenceConfiguration =
  | "preview"
  | "reminder"
  | "none"
  | "complete"
  | "not set";

export function getNotificationPreferenceConfiguration(
  isReminderEnabled: boolean | undefined,
  isPreviewEnabled: boolean | undefined
): NotificationPreferenceConfiguration {
  if (isReminderEnabled === undefined || isPreviewEnabled === undefined) {
    return "not set";
  }
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

export async function trackNotificationPreferenceConfiguration(
  isReminderEnabled: boolean,
  isPreviewEnabled: boolean,
  flow: FlowType,
  state: GlobalState
) {
  const configuration: NotificationPreferenceConfiguration =
    getNotificationPreferenceConfiguration(isReminderEnabled, isPreviewEnabled);
  await updateMixpanelProfileProperties(state, {
    property: "NOTIFICATION_CONFIGURATION",
    value: configuration
  });
  await updateMixpanelSuperProperties(state, {
    property: "NOTIFICATION_CONFIGURATION",
    value: configuration
  });
  await mixpanelTrack(
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
