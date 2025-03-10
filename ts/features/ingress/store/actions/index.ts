import { ActionType, createStandardAction } from "typesafe-actions";
import { OfflineAccessReasonEnum } from "../reducer";

export const setIsBlockingScreen = createStandardAction(
  "SET_IS_BLOCKING_SCREEN"
)();

export const setOfflineAccessReason = createStandardAction(
  "SET_OFFLINE_ACCESS_REASON"
)<OfflineAccessReasonEnum>();

export const resetOfflineAccessReason = createStandardAction(
  "RESET_OFFLINE_ACCESS_REASON"
)();

export type IngressScreenActions = ActionType<
  | typeof setIsBlockingScreen
  | typeof setOfflineAccessReason
  | typeof resetOfflineAccessReason
>;
