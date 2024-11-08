import { ActionType, createStandardAction } from "typesafe-actions";
import { LandingScreenBannerId } from "../utils/landingScreenBannerMap";

type UpdateBannerVisibilityPayloadType = {
  id: LandingScreenBannerId;
  enabled: boolean;
};
export const updateLandingScreenBannerVisibility = createStandardAction(
  "UPDATE_LANDING_SCREEN_BANNER_STATE"
)<UpdateBannerVisibilityPayloadType>();

export type LandingScreenBannerActions = ActionType<
  typeof updateLandingScreenBannerVisibility
>;
