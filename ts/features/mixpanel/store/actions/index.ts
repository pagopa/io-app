import { ActionType, createStandardAction } from "typesafe-actions";

export const setIsMixpanelInitialized = createStandardAction(
  "SET_IS_MIXPANEL_INITIALIZED"
)<boolean>();

export type MixpanelFeatureActions = ActionType<
  typeof setIsMixpanelInitialized
>;
