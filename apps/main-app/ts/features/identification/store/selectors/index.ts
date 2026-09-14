import { GlobalState } from "../../../../store/reducers/types";

export const identificationFailSelector = (state: GlobalState) =>
  state.identification.fail;

export const progressSelector = (state: GlobalState) =>
  state.identification.progress;
