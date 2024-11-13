import { ActionType, createStandardAction } from "typesafe-actions";

export const setEngagementScreenShown = createStandardAction(
  "SET_ENGAGEMENT_SCREEN_SHOWN"
)<void>();
export const setPushPermissionsRequestDuration = createStandardAction(
  "SET_PUSH_PERMISSIONS_REQUEST_DURATION"
)<number>();

export type UserBehaviourActions =
  | ActionType<typeof setEngagementScreenShown>
  | ActionType<typeof setPushPermissionsRequestDuration>;
