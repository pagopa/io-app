import { ActionType, createStandardAction } from "typesafe-actions";

/**
 * The action to activate/deactivate mixpanel
 *
 * - True to initialize
 * - False to terminate
 */
export const setMixpanelEnabled = createStandardAction(
  "MIXPANEL_SET_ENABLED"
)<boolean>();

export type MixpanelActions = ActionType<MixpanelActionsTypes>;

type MixpanelActionsTypes = typeof setMixpanelEnabled;
