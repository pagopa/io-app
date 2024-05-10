import { GlobalState } from "../../../../store/reducers/types";

export const fimsConsentsSelector = (state: GlobalState) =>
  state.features.fims.consents;
export const fimsCTAUrlSelector = (state: GlobalState) =>
  state.features.fims.ctaUrl;
