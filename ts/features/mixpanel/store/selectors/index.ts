import { GlobalState } from "../../../../store/reducers/types";

const mixpanelFeatureSelector = (state: GlobalState) => state.features.mixpanel;

export const isMixpanelInitializedSelector = (state: GlobalState) =>
  mixpanelFeatureSelector(state).isMixpanelInitialized;
