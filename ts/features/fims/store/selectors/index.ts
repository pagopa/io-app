import { GlobalState } from "../../../../store/reducers/types";

export const fimsConsentsDataSelector = (state: GlobalState) =>
  state.features.fims.consentsData;

export const fimsCTAUrlSelector = (state: GlobalState) =>
  state.features.fims.ctaUrl;
