import { GlobalState } from "../../../../store/reducers/types";

export const utmLinkCampaignSelector = (state: GlobalState) =>
  state.features.utmLink.utmCampaign;

export const utmLinkSourceSelector = (state: GlobalState) =>
  state.features.utmLink.utmSource;

export const utmLinkMediumSelector = (state: GlobalState) =>
  state.features.utmLink.utmMedium;
