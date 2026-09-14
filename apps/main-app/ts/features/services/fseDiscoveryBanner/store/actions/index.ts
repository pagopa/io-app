import { ActionType, createAction } from "typesafe-actions";

export const persistedDismissFseDiscoveryBanner = createAction(
  "FSE_DISCOVERY_BANNER_DISMISS"
);

export type FseDiscoveryBannerActions = ActionType<
  typeof persistedDismissFseDiscoveryBanner
>;
