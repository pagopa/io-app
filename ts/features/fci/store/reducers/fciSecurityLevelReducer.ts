import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { fciL3LocalFlag } from "../actions";
import { GlobalState } from "../../../../store/reducers/types";

export type FciSecurityLevelStateType = {
  localFeatureFlag: boolean;
};

const initialState: FciSecurityLevelStateType = {
  localFeatureFlag: false
};

/**
 * Store security level info for FCI flow
 */
export const fciSecurityLevelReducer = (
  state: FciSecurityLevelStateType = initialState,
  action: Action
): FciSecurityLevelStateType => {
  switch (action.type) {
    case getType(fciL3LocalFlag):
      return { ...state, localFeatureFlag: action.payload };
  }
  return state;
};

export const fciSecurityLevelLocalFeatureFlagSelector = (
  state: GlobalState
): FciSecurityLevelStateType["localFeatureFlag"] =>
  state.features.fci.securityLevel.localFeatureFlag;
