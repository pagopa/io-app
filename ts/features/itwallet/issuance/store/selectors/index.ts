import { GlobalState } from "../../../../../store/reducers/types";

export const itwIntegrityKeyTagSelector = (state: GlobalState) =>
  state.features.itWallet.issuance.integrityKeyTag;

export const itwIPZSHasReadPolicySelector = (state: GlobalState) =>
  state.features.itWallet.issuance.hasReadIPZSPolicy;
