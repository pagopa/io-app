import { createSelector } from "reselect";
import { getType } from "typesafe-actions";

import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { fciL3LocalFlag } from "../actions";
import { isFciSecurityLevelCheckRemoteFFEnabledSelector } from "../selectors/remoteConfig";

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

export const fciSecurityLevelLocalFFSelector = (
  state: GlobalState
): FciSecurityLevelStateType["localFeatureFlag"] =>
  state.features.fci.securityLevel.localFeatureFlag;

export const isFciSecurityLevelCheckEnabledSelector = createSelector(
  fciSecurityLevelLocalFFSelector,
  isFciSecurityLevelCheckRemoteFFEnabledSelector,
  (localFlag, remoteConfigFlag) => localFlag || remoteConfigFlag
);
