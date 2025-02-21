import { ActionType, createStandardAction } from "typesafe-actions";

export type UtmLinkParams = {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string | undefined;
};

export const utmLinkClearParams = createStandardAction(
  "UTM_LINK_CLEAR_UTM_PARAMS"
)();

export const utmLinkSetParams = createStandardAction(
  "UTM_LINK_SET_UTM_PARAMS"
)<UtmLinkParams>();

export type UtmLinkActions = ActionType<
  typeof utmLinkClearParams | typeof utmLinkSetParams
>;
