import { GlobalState } from "../../../../../store/reducers/types";

export const itwIntegrityKeyTagSelector = (state: GlobalState) =>
  state.features.itWallet.issuance.integrityKeyTag;

/**
 * Selector that returns the integrityService status
 */
export const itwIntegrityServiceStatusSelector = (state: GlobalState) =>
  state.features.itWallet.issuance.integrityServiceStatus;
