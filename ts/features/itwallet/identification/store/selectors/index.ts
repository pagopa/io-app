import { GlobalState } from "../../../../../store/reducers/types";

export const itwIsNfcEnabledSelector = (state: GlobalState) =>
  state.features.itw.identification.isNfcEnabled;
