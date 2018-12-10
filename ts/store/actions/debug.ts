import { ActionType, createStandardAction } from "typesafe-actions";

/**
 * Enables or disables debug mode
 */
export const setDebugModeEnabled = createStandardAction(
  "DEBUG_MODE_SET_ENABLED"
)<boolean>();

export type DebugActions = ActionType<typeof setDebugModeEnabled>;
