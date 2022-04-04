import { ActionType, createStandardAction } from "typesafe-actions";

/**
 * Enables or disables debug mode
 */
export const setDebugModeEnabled = createStandardAction(
  "DEBUG_MODE_SET_ENABLED"
)<boolean>();

/**
 * Used only for debug purpose until to react-navigation v6 the upgrade
 * TODO: Remove after the upgrade to react-navigation v6
 * @deprecated
 */
export const setDebugCurrentRouteName = createStandardAction(
  "DEBUG_SET_CURRENT_ROUTE"
)<string>();

export type DebugActions =
  | ActionType<typeof setDebugModeEnabled>
  | ActionType<typeof setDebugCurrentRouteName>;
