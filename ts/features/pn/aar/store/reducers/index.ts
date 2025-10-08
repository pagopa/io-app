import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { isAARRemoteEnabled } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isAARLocalEnabled } from "../../../../../store/reducers/persistedPreferences";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  AARFlowState,
  isValidAARStateTransition,
  sendAARFlowStates
} from "../../utils/stateUtils";
import { setAarFlowState, terminateAarFlow } from "../actions";

const emptyArray: ReadonlyArray<string> = [];

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

export const isAAREnabled = (state: GlobalState): boolean =>
  isAARLocalEnabled(state) && isAARRemoteEnabled(state);

export const currentAARFlowData = (state: GlobalState) =>
  state.features.pn.aarFlow;
export const currentAARFlowStateType = (state: GlobalState) =>
  state.features.pn.aarFlow.type;
export const currentAARFlowStateErrorCodes = (state: GlobalState) => {
  const aarFlow = state.features.pn.aarFlow;
  if (aarFlow.type === sendAARFlowStates.ko) {
    return aarFlow.error?.errors?.map(x => x.code) ?? emptyArray;
  } else {
    return emptyArray;
  }
};
