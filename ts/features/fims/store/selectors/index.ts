import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";

const fimsFeatureSelector = (state: GlobalState) => state.features.fims;

export const fimsConsentsSelector = createSelector(
  fimsFeatureSelector,
  state => state.consents
);
export const fimsCTAUrlSelector = createSelector(
  fimsFeatureSelector,
  state => state.ctaUrl
);
