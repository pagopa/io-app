import { ActionType, createStandardAction } from "typesafe-actions";

import { LandingScreenBannerId } from "../utils/landingScreenBannerMap";

type UpdateBannerVisibilityPayloadType = {
  enabled: boolean;
  id: LandingScreenBannerId;
};
export const updateLandingScreenBannerVisibility = createStandardAction(
  "UPDATE_LANDING_SCREEN_BANNER_STATE"
)<UpdateBannerVisibilityPayloadType>();

export type LandingScreenBannerActions = ActionType<
  typeof updateLandingScreenBannerVisibility
>;
