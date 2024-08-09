import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import {
  itwLifecycleStateUpdated,
  itwLifecycleReducersReset
} from "../actions";

export enum ItwLifecycleState {
  /**
   * The wallet instance is not active and there is no associated integrity key tag.
   * The user cannot get any credential.
   */
  "ITW_LIFECYCLE_INSTALLED",
  /**
   * The wallet instance is registered and there is an associated integrity key tag.
   * The user can get a wallet attestation and an eID.
   */
  "ITW_LIFECYCLE_OPERATIONAL",
  /**
   * The wallet instance is registered, there is an associated integrity key tag
   * and the user has been issued a valid eID. The user can now get other credentials.
   */
  "ITW_LIFECYCLE_VALID",
  /**
   * The wallet instance is revoked.
   */
  "ITW_LIFECYCLE_DEACTIVATED"
}

export const itwLifecycleInitialState: ItwLifecycleState =
  ItwLifecycleState.ITW_LIFECYCLE_INSTALLED;

/**
 * This reducer handles the wallet lifecycle state.
 */
const reducer = (
  state: ItwLifecycleState = itwLifecycleInitialState,
  action: Action
): ItwLifecycleState => {
  switch (action.type) {
    case getType(itwLifecycleStateUpdated):
      return action.payload;
    case getType(itwLifecycleReducersReset):
      return ItwLifecycleState.ITW_LIFECYCLE_INSTALLED;
    default:
      return state;
  }
};

export default reducer;
