import { getType } from "typesafe-actions";

import { Action } from "../../../../../store/actions/types";
import {
  AarFlowState,
  isValidAarStateTransition
} from "../../utils/stateUtils";
import { setAarFlowState, terminateAarFlow } from "../actions";

export const INITIAL_AAR_FLOW_STATE: AarFlowState = {
  type: "none"
};

export const aarFlowReducer = (
  state: AarFlowState = INITIAL_AAR_FLOW_STATE,
  action: Action
): AarFlowState => {
  switch (action.type) {
    case getType(setAarFlowState):
      return {
        ...(isValidAarStateTransition(state.type, action.payload.type)
          ? action.payload
          : state)
      };

    case getType(terminateAarFlow):
      const payloadState = action.payload.currentFlowState ?? state.type;
      if (payloadState === state.type) {
        return INITIAL_AAR_FLOW_STATE;
      }
  }
  return state;
};
