import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import {
  AARFlowState,
  isValidAARStateTransition
} from "../../utils/stateUtils";
import { setAarFlowState, terminateAarFlow } from "../actions";

export const INITIAL_AAR_FLOW_STATE: AARFlowState = {
  type: "none"
};

export const aarFlowReducer = (
  state: AARFlowState = INITIAL_AAR_FLOW_STATE,
  action: Action
): AARFlowState => {
  switch (action.type) {
    case getType(setAarFlowState):
      return {
        ...(isValidAARStateTransition(state.type, action.payload.type)
          ? action.payload
          : state)
      };

    case getType(terminateAarFlow):
      return INITIAL_AAR_FLOW_STATE;
  }
  return state;
};
