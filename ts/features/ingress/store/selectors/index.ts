import { GlobalState } from "../../../../store/reducers/types";

export const isBlockingScreenSelector = (state: GlobalState) =>
  state.features.ingress.isBlockingScreen;

export const offlineAccessReasonSelector = (state: GlobalState) =>
  state.features.ingress.offlineAccessReason;
