/**
 * Action types and action creator related to the Profile settings.
 */
import { ActionType, createStandardAction } from "typesafe-actions";

export const setShowProfileBanner = createStandardAction(
  "HIDE_PROFILE_BANNER"
)<boolean>();

export const setHasUserAcknowledgedSettingsBanner = createStandardAction(
  "SET_HAS_USER_ACKNOWLEDGE_SETTINGS_BANNER"
)<boolean>();

export type ProfileSettingsActions =
  | ActionType<typeof setShowProfileBanner>
  | ActionType<typeof setHasUserAcknowledgedSettingsBanner>;
