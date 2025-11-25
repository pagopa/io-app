import { GlobalState } from "../../../../../../store/reducers/types";

export const cdcStatusSelector = (state: GlobalState) =>
  state.features.cdc.wallet.cdcStatus;
