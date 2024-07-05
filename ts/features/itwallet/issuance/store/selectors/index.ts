import { GlobalState } from "../../../../../store/reducers/types";

export const itwHardwareKeyTagSelector = (state: GlobalState) =>
  state.features.itWallet.issuance.hardwareKeyTag;
