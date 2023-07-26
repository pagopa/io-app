import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  itwLifecycleOperational,
  itwLifecycleDeactivated,
  itwLifecycleValid
} from "../actions";

export enum ItwLifecycleState {
  "ITW_LIFECYCLE_VALID",
  "ITW_LIFECYCLE_OPERATIONAL",
  "ITW_LIFECYCLE_DEACTIVATED"
}

const emptyState: ItwLifecycleState =
  ItwLifecycleState.ITW_LIFECYCLE_OPERATIONAL;

/**
 * This reducer handles the requirements check for the IT Wallet activation.
 * It manipulates a pot which maps to an error if the requirements are not met or to true if they are.
 * A saga is attached to the request action to check the requirements.
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
 * Selects the wallet instance attestation state.
 * @param state the global state
 * @returns the wallet instance attestation state
 */
export const itwLifecycleSelector = (state: GlobalState) =>
  state.features.itWallet.lifecycle;

export const itwLifecycleIsOperational = (state: GlobalState) =>
  state.features.itWallet.lifecycle ===
  ItwLifecycleState.ITW_LIFECYCLE_OPERATIONAL;

export default reducer;
