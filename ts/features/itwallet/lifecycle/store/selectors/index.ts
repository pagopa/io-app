import { GlobalState } from "../../../../../store/reducers/types";
import { ItwLifecycleState } from "../reducers";

export const itwLifecycleSelector = (state: GlobalState) =>
  state.features.itWallet.lifecycle;

export const itwLifecycleIsOperationalSelector = (state: GlobalState) =>
  state.features.itWallet.lifecycle ===
  ItwLifecycleState.ITW_LIFECYCLE_OPERATIONAL;

export const itwLifecycleIsValidSelector = (state: GlobalState) =>
  state.features.itWallet.lifecycle === ItwLifecycleState.ITW_LIFECYCLE_VALID;
