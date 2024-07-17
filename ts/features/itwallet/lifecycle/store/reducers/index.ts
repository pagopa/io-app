import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { itwLifecycleStateUpdated } from "../actions";

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
