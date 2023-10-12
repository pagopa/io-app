import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { fciEnvironmentSet } from "../actions";
import { EnvironmentEnum } from "../../../../../definitions/fci/Environment";

export type FciEnvironmentState = EnvironmentEnum;

const initialState: FciEnvironmentState = EnvironmentEnum.prod;

/**
 * Store download info for FCI document
 */
const fciEnvironmentReducer = (
  state: FciEnvironmentState = initialState,
  action: Action
): FciEnvironmentState => {
  switch (action.type) {
    case getType(fciEnvironmentSet):
      return action.payload;
  }
  return state;
};

// Selectors
export const fciEnvironmentSelector = (
  state: GlobalState
): FciEnvironmentState => state.features.fci.environment;

export default fciEnvironmentReducer;
