import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  itwLifecycleDeactivated,
  itwLifecycleOperational,
  itwLifecycleValid
} from "../actions/itwLifecycleActions";

export enum ItwLifecycleState {
  "ITW_LIFECYCLE_VALID",
  "ITW_LIFECYCLE_OPERATIONAL",
  "ITW_LIFECYCLE_DEACTIVATED"
}

const emptyState: ItwLifecycleState =
  ItwLifecycleState.ITW_LIFECYCLE_OPERATIONAL;

/**
 * This reducer handles the wallet lifecycle state.
 * @param state the current state
 * @param action the dispatched action
 * @returns the result state
 */
const reducer = (
  state: ItwLifecycleState = emptyState,
  action: Action
): ItwLifecycleState => {
  switch (action.type) {
    case getType(itwLifecycleOperational):
      return ItwLifecycleState.ITW_LIFECYCLE_OPERATIONAL;
    case getType(itwLifecycleValid):
      return ItwLifecycleState.ITW_LIFECYCLE_VALID;
    case getType(itwLifecycleDeactivated):
      return ItwLifecycleState.ITW_LIFECYCLE_DEACTIVATED;
  }
  return state;
};

/**
 * Selects the current wallet lifecycle state.
 * @param state the global state
 * @returns the wallet lifecycle state.
 */
export const itwLifecycleSelector = (state: GlobalState) =>
  state.features.itWallet.lifecycle;

/**
 * Checks whether the wallet is operational.
 * @param state the global state
 * @returns true if the wallet is operational, false otherwise.
 */
export const itwLifecycleIsOperationalSelector = (state: GlobalState) =>
  state.features.itWallet.lifecycle ===
  ItwLifecycleState.ITW_LIFECYCLE_OPERATIONAL;

/**
 * Checks whether the wallet is valid.
 * @param state the global state
 * @returns true if the wallet is valid, false otherwise.
 */
export const itwLifecycleIsValidSelector = (state: GlobalState) =>
  state.features.itWallet.lifecycle === ItwLifecycleState.ITW_LIFECYCLE_VALID;

export default reducer;
