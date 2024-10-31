import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import {
  itwLifecycleIntegrityServiceReady,
  itwLifecycleStateUpdated,
  itwLifecycleStoresReset
} from "../actions";

export enum ItwLifecycleStatus {
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

export interface ItwLifecycleState {
  status: ItwLifecycleStatus;
  integrityServiceReady?: boolean;
}

export const itwLifecycleInitialState: ItwLifecycleState = {
  status: ItwLifecycleStatus.ITW_LIFECYCLE_INSTALLED,
  integrityServiceReady: false
};

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
    case getType(itwLifecycleStoresReset):
      return { ...state, status: ItwLifecycleStatus.ITW_LIFECYCLE_INSTALLED };
    case getType(itwLifecycleIntegrityServiceReady):
      return { ...state, integrityServiceReady: action.payload };
    default:
      return state;
  }
};

export default reducer;
