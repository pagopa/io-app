import { ActionType, createStandardAction } from "typesafe-actions";

export const setCgnDiscoveryBannerClosed = createStandardAction(
  "CGN_DISCOVERY_BANNER_CLOSED"
)<boolean>();

export type CgnBannersActions = ActionType<typeof setCgnDiscoveryBannerClosed>;
