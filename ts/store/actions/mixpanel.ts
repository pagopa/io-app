import { ActionType, createStandardAction } from "typesafe-actions";

/**
 * the action to activate/deactivate mixpanel
 * - true to initialize
 * - false to terminate
 */
export const setMixpanelEnabled = createStandardAction(
  "MIXPANEL_SET_ENABLED"
)<boolean>();

type MixpanelActionsTypes = typeof setMixpanelEnabled;

export type MixpanelActions = ActionType<MixpanelActionsTypes>;
