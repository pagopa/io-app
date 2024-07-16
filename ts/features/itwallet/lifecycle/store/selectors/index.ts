import * as O from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../store/reducers/types";
import { ItwLifecycleState } from "../reducers";

export const itwLifecycleSelector = (state: GlobalState) =>
  state.features.itWallet.lifecycle;

export const itwLifecycleIsInstalledSelector = (state: GlobalState) =>
  state.features.itWallet.lifecycle ===
    ItwLifecycleState.ITW_LIFECYCLE_INSTALLED &&
  O.isNone(state.features.itWallet.issuance.integrityKeyTag);

export const itwLifecycleIsOperationalSelector = (state: GlobalState) =>
  state.features.itWallet.lifecycle ===
    ItwLifecycleState.ITW_LIFECYCLE_OPERATIONAL &&
  O.isSome(state.features.itWallet.issuance.integrityKeyTag);

export const itwLifecycleIsValidSelector = (state: GlobalState) =>
  state.features.itWallet.lifecycle === ItwLifecycleState.ITW_LIFECYCLE_VALID;
