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

/**
 * Adds debug data to be displayed in the DebugInfoOverlay
 */
export const setDebugData =
  createStandardAction("DEBUG_SET_DATA")<Record<string, unknown>>();

/**
 * Removes all the debug data stored
 */
export const resetDebugData =
  createStandardAction("DEBUG_RESET_DATA")<ReadonlyArray<string>>();

export type DebugActions =
  | ActionType<typeof setDebugModeEnabled>
  | ActionType<typeof setDebugCurrentRouteName>
  | ActionType<typeof setDebugData>
  | ActionType<typeof resetDebugData>;
