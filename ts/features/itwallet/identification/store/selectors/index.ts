import { GlobalState } from "../../../../../store/reducers/types";

// TODO: [SIW-1404] remove these selectors and move the logic to xstate
export const itwIsNfcEnabledSelector = (state: GlobalState) =>
  state.features.itWallet.identification.isNfcEnabled;

export const itwIsCieSupportedSelector = (state: GlobalState) =>
  state.features.itWallet.identification.isCieSupported;
