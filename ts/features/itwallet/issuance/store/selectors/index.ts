import { GlobalState } from "../../../../../store/reducers/types";

export const itwIntegrityKeyTagSelector = (state: GlobalState) =>
  state.features.itWallet.issuance.integrityKeyTag;

/**
 * Selector that returns the integrityServiceReady flag.
 */
export const itwIntegrityServiceReadySelector = (state: GlobalState) =>
  state.features.itWallet.issuance.integrityServiceReady;
