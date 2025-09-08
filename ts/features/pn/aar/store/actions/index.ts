import { ActionType, createStandardAction } from "typesafe-actions";
import { AARFlowState } from "../reducers";

export const setAarFlowState =
  createStandardAction("SET_AAR_FLOW_STATE")<AARFlowState>();

export const terminateAarFlow = createStandardAction("TERMINATE_AAR_FLOW")();

export type AARFlowStateActions = ActionType<
  typeof setAarFlowState | typeof terminateAarFlow
>;
