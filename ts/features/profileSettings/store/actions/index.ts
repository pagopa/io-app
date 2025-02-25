/**
 * Action types and action creator related to the Profile settings.
 */
import { ActionType, createStandardAction } from "typesafe-actions";

export const setHasUserAcknowledgedSettingsBanner = createStandardAction(
  "SET_HAS_USER_ACKNOWLEDGE_SETTINGS_BANNER"
)<boolean>();

export type ProfileSettingsActions = ActionType<
  typeof setHasUserAcknowledgedSettingsBanner
>;
