import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import {
  itwLifecycleDeactivated,
  itwLifecycleInstalled,
  itwLifecycleOperational,
  itwLifecycleValid
} from "../actions";

export enum ItwLifecycleState {
  "ITW_LIFECYCLE_INSTALLED",
  "ITW_LIFECYCLE_OPERATIONAL",
  "ITW_LIFECYCLE_VALID",
  "ITW_LIFECYCLE_DEACTIVATED"
}

const initialState: ItwLifecycleState =
  ItwLifecycleState.ITW_LIFECYCLE_INSTALLED;

/**
 * This reducer handles the wallet lifecycle state.
 */
const reducer = (
  state: ItwLifecycleState = initialState,
  action: Action
): ItwLifecycleState => {
  switch (action.type) {
    case getType(itwLifecycleOperational):
      return ItwLifecycleState.ITW_LIFECYCLE_OPERATIONAL;
    case getType(itwLifecycleValid):
      return ItwLifecycleState.ITW_LIFECYCLE_VALID;
    case getType(itwLifecycleDeactivated):
      return ItwLifecycleState.ITW_LIFECYCLE_DEACTIVATED;
    case getType(itwLifecycleInstalled):
      return ItwLifecycleState.ITW_LIFECYCLE_INSTALLED;
  }
  return state;
};

export default reducer;
