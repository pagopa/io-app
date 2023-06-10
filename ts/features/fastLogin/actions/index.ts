import { ActionType, createStandardAction } from "typesafe-actions";
import { Action } from "../../../store/actions/types";

type PendingActionPayload = { pendingAction: Action };
export const savePendingAction = createStandardAction(
  "SAVE_PENDING_ACTION"
)<PendingActionPayload>();

type PendingActionType = typeof savePendingAction;

export type FastLoginActions = ActionType<PendingActionType>;
