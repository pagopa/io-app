import { GlobalState } from "../../../../store/reducers/types";

export const utmLinkCampaignSelector = (state: GlobalState) =>
  state.features.utmLink.utmCampaign;
