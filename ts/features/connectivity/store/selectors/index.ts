import { GlobalState } from "../../../../store/reducers/types";

export const connectivityStatusSelector = (state: GlobalState) =>
  state.features.connectivityStatus;

export const isConnectedSelector = (state: GlobalState) =>
  state.features.connectivityStatus.isConnected;
