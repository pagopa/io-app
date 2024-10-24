import { ActionType, createStandardAction } from "typesafe-actions";
import { LandingScreenBannerId } from "./reducer";

type UpdateBannerVisibilityPayloadType = {
  id: LandingScreenBannerId;
  enabled: boolean;
};
export const updateLandingScreenBannerVisibility = createStandardAction(
  "UPDATE_HOME_SCREEN_BANNER_STATE"
)<UpdateBannerVisibilityPayloadType>();

export type LandingScreenBannerActions = ActionType<
  typeof updateLandingScreenBannerVisibility
>;
