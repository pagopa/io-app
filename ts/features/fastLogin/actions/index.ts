import { ActionType, createStandardAction } from "typesafe-actions";
import { Action } from "../../../store/actions/types";

type RetriableActionPayload = { actionToRetry: Action };
export const retriableAction =
  createStandardAction("RETRIABLE_ACTION")<RetriableActionPayload>();

type RetriableActionType = typeof retriableAction;

export type FastLoginActions = ActionType<RetriableActionType>;
