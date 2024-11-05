import { GlobalState } from "../../../../store/reducers/types";

export const isMixpanelInitializedSelector = (state: GlobalState) =>
  state.features.mixpanel.isMixpanelInitialized;
