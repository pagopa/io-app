import { ActionType, createStandardAction } from "typesafe-actions";

export const utmLinkClearCampaign = createStandardAction(
  "UTM_LINK_CLEAR_UTM_CAMPAIGN"
)();

export const utmLinkSetCampaign = createStandardAction(
  "UTM_LINK_SET_UTM_CAMPAIGN"
)<string>();

export type UtmLinkActions = ActionType<
  typeof utmLinkClearCampaign | typeof utmLinkSetCampaign
>;
