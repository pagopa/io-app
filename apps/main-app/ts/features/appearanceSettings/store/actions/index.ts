/**
 * Action types and action creator related to the Appearance settings.
 */
import { ActionType, createStandardAction } from "typesafe-actions";

export const setShowAppearanceSettingsBanner = createStandardAction(
  "SHOW_APPEARANCE_SETTINGS_BANNER"
)<boolean>();

export type AppearanceSettingsActions = ActionType<
  typeof setShowAppearanceSettingsBanner
>;
