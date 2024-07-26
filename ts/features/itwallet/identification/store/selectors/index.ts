import { GlobalState } from "../../../../../store/reducers/types";

export const itwIsNfcEnabledSelector = (state: GlobalState) =>
  state.features.itWallet.identification.isNfcEnabled;

export const itwIsCieSupportedSelector = (state: GlobalState) =>
  state.features.itWallet.identification.isCieSupported;
