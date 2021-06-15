import { ActionType, createStandardAction } from "typesafe-actions";

export const setMixpanelEnabled = createStandardAction("MIXPANEL_SET_ENABLED")<
  boolean
>();

type MixpanelActionsTypes = typeof setMixpanelEnabled;

export type MixpanelActions = ActionType<MixpanelActionsTypes>;
