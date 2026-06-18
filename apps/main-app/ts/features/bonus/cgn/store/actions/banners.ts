import { ActionType, createStandardAction } from "typesafe-actions";

export const closeCgnDiscoveryBanner = createStandardAction(
  "CGN_DISCOVERY_BANNER_CLOSED"
)();

export type CgnBannersActions = ActionType<typeof closeCgnDiscoveryBanner>;
