import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { itwLifecycleStateUpdated } from "../actions";

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
    case getType(itwLifecycleStateUpdated):
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
