import { GlobalState } from "../../../../store/reducers/types";

const ingressScreenSelector = (state: GlobalState) => state.ingress;

export const isBlockingScreenSelector = (state: GlobalState) =>
  ingressScreenSelector(state).isBlockingScreen;
