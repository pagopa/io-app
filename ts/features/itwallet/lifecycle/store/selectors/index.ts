import * as O from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../store/reducers/types";
import { ItwLifecycleState } from "../reducers";

export const itwLifecycleSelector = (state: GlobalState) =>
  state.features.itWallet.lifecycle;

/**
 * The wallet instance is installed. In this state
 * the integrity key tag should not exist.
 */
export const itwLifecycleIsInstalledSelector = (state: GlobalState) =>
  state.features.itWallet.lifecycle ===
    ItwLifecycleState.ITW_LIFECYCLE_INSTALLED &&
  O.isNone(state.features.itWallet.issuance.integrityKeyTag);

/**
 * The wallet instance is operational. In this state
 * the integrity key tag must exist.
 */
export const itwLifecycleIsOperationalSelector = (state: GlobalState) =>
  state.features.itWallet.lifecycle ===
    ItwLifecycleState.ITW_LIFECYCLE_OPERATIONAL &&
  O.isSome(state.features.itWallet.issuance.integrityKeyTag);

export const itwLifecycleIsValidSelector = (state: GlobalState) =>
  state.features.itWallet.lifecycle === ItwLifecycleState.ITW_LIFECYCLE_VALID;
