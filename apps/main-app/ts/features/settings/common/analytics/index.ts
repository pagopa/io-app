import { ServicesPreferencesModeEnum } from "../../../../../definitions/identity/ServicesPreferencesMode";
import { ColorModeChoice } from "../../../../hooks/useAppThemeConfiguration";
import { mixpanelTrack } from "../../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../../mixpanelConfig/profileProperties";
import { updateMixpanelSuperProperties } from "../../../../mixpanelConfig/superProperties";
import { TypefaceChoice } from "../../../../store/actions/persistedPreferences";
import { GlobalState } from "../../../../store/reducers/types";
import { buildEventProperties, FlowType } from "../../../../utils/analytics";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { SETTINGS_ROUTES } from "../navigation/routes";
import { profileLoadSuccess } from "../store/actions";

export type NotificationPermissionType = "disabled" | "enabled";

export type NotificationPreferenceConfiguration =
  | "complete"
  | "none"
  | "not set"
  | "preview"
  | "reminder";
export type NotificationTokenType = "no" | "yes";

export type ServiceConfigurationTrackingType =
  | "not set"
  | ServicesPreferencesModeEnum
  | undefined;

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

export function trackCreatePinSuccess(flow: FlowType) {
  void mixpanelTrack(
    "CREATE_PIN_SUCCESS",
    buildEventProperties("UX", "action", undefined, flow)
  );
}

export function trackIdpAuthenticationSuccessScreen(idpId: string | undefined) {
  void mixpanelTrack("IDENTIFICATION_CONFIRM_SCREEN", {
    idp: idpId,
    ...buildEventProperties("UX", "screen_view")
  });
}

export function trackIngressScreen() {
  void mixpanelTrack(
    "INITIALIZATION_LOADING",
    buildEventProperties("UX", "screen_view")
  );
}

export function trackMixpanelScreen(flow: FlowType) {
  void mixpanelTrack(
    "TRACKING",
    buildEventProperties("UX", "screen_view", undefined, flow)
  );
}

export function trackNotificationScreen(flow: FlowType) {
  void mixpanelTrack(
    "NOTIFICATION_PREFERENCE",
    buildEventProperties("UX", "screen_view", undefined, flow)
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

export function trackPinError(error: "confirm" | "creation", flow: FlowType) {
  void mixpanelTrack(
    "PIN_CREATION_ERROR",
    buildEventProperties("UX", "error", { error }, flow)
  );
}

export function trackPinScreen(flow: FlowType) {
  void mixpanelTrack(
    "PIN_CREATION",
    buildEventProperties("UX", "screen_view", undefined, flow)
  );
}

export async function trackProfileLoadSuccess(state: GlobalState) {
  await updateMixpanelSuperProperties(state);
  await updateMixpanelProfileProperties(state);
  mixpanelTrack(profileLoadSuccess.toString());
}

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
  mixpanelTrack(
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

export function trackServiceConfigurationScreen(flow: FlowType) {
  void mixpanelTrack(
    "SERVICE_PREFERENCE",
    buildEventProperties("UX", "screen_view", undefined, flow)
  );
}
export function trackThankYouPageScreen() {
  void mixpanelTrack("LOGIN_TYP", buildEventProperties("UX", "screen_view"));
}

export const getNotificationPermissionType = (
  hasPermission: boolean
): NotificationPermissionType => (hasPermission ? "enabled" : "disabled");

export const getNotificationTokenType = (
  state: GlobalState
): NotificationTokenType =>
  state.notifications.installation.token != null &&
  state.notifications.installation.token.trim().length > 0
    ? "yes"
    : "no";

export function trackAppearancePreferenceScreenView() {
  void mixpanelTrack(
    "SETTINGS_PREFERENCES_UI",
    buildEventProperties("UX", "screen_view")
  );
}

export function trackAppearancePreferenceThemeUpdate(
  choice: ColorModeChoice,
  state: GlobalState
) {
  void mixpanelTrack(
    "SETTINGS_PREFERENCES_UI_THEME_UPDATE",
    buildEventProperties("UX", "action", {
      current_theme: choice
    })
  );
  void updateMixpanelProfileProperties(state, {
    property: "THEME_PREFERENCE",
    value: choice
  });
}

export function trackAppearancePreferenceTypefaceUpdate(
  choice: TypefaceChoice,
  state: GlobalState
) {
  void mixpanelTrack(
    "SETTINGS_PREFERENCES_UI_FONT_UPDATE",
    buildEventProperties("UX", "action", {
      current_font: choice
    })
  );
  void updateMixpanelProfileProperties(state, {
    property: "FONT_PREFERENCE",
    value: choice
  });
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
  mixpanelTrack(
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

export function trackPressLogoutCancelFromIO() {
  void mixpanelTrack("LOGOUT_CANCEL", buildEventProperties("UX", "action"));
}

export function trackPressLogoutConfirmFromIO() {
  void mixpanelTrack("LOGOUT_CONFIRM", buildEventProperties("UX", "action"));
}

export function trackPressLogoutFromIO() {
  void mixpanelTrack("LOGOUT_START", buildEventProperties("UX", "action"));
}

export function trackSettingsDiscoverBannerClosure() {
  const eventName = "CLOSE_BANNER";
  const props = buildEventProperties("UX", "action", {
    banner_id: "settingsDiscoveryBanner",
    banner_page: MESSAGES_ROUTES.MESSAGES_HOME,
    banner_landing: SETTINGS_ROUTES.SETTINGS_MAIN
  });
  void mixpanelTrack(eventName, props);
}

export function trackSettingsDiscoverBannerTap() {
  const eventName = "TAP_BANNER";
  const props = buildEventProperties("UX", "action", {
    banner_id: "settingsDiscoveryBanner",
    banner_page: MESSAGES_ROUTES.MESSAGES_HOME,
    banner_landing: SETTINGS_ROUTES.SETTINGS_MAIN
  });
  void mixpanelTrack(eventName, props);
}

export function trackSettingsDiscoverBannerVisualized() {
  const eventName = "BANNER";
  const props = buildEventProperties("UX", "screen_view", {
    banner_id: "settingsDiscoveryBanner",
    banner_page: MESSAGES_ROUTES.MESSAGES_HOME,
    banner_landing: SETTINGS_ROUTES.SETTINGS_MAIN
  });
  void mixpanelTrack(eventName, props);
}
