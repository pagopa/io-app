import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { setIsMixpanelInitialized } from "../actions";

export type MixpanelState = {
  isMixpanelInitialized: boolean;
};

export const initialMixpanelState: MixpanelState = {
  isMixpanelInitialized: false
};

export const mixpanelReducer = (
  state = initialMixpanelState,
  action: Action
): MixpanelState => {
  switch (action.type) {
    case getType(setIsMixpanelInitialized): {
      return {
        ...state,
        isMixpanelInitialized: action.payload
      };
    }
    default:
      return state;
  }
};
