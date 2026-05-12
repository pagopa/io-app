import { GlobalState } from "../../../../../../store/reducers/types";

export const itwProximityConsentsSelector = (state: GlobalState) =>
  state.features.itWallet.proximity.consents;
