import { ActionType, createStandardAction } from "typesafe-actions";

export const setEngagementScreenShown = createStandardAction(
  "SET_ENGAGEMENT_SCREEN_SHOWN"
)<void>();

export type UserBehaviourActions = ActionType<typeof setEngagementScreenShown>;
