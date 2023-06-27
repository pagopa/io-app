import { ActionType, createStandardAction } from "typesafe-actions";
import { Action } from "../../../store/actions/types";

type PendingActionPayload = { pendingAction: Action };
export const savePendingAction = createStandardAction(
  "SAVE_PENDING_ACTION"
)<PendingActionPayload>();

export const clearPendingAction = createStandardAction(
  "CLEAR_PENDING_ACTION"
)<void>();

type PendingActionTypes = typeof savePendingAction | typeof clearPendingAction;

export type FastLoginActions = ActionType<PendingActionTypes>;
