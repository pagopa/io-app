import { getType } from "typesafe-actions";

import { Action } from "../../../store/actions/types";
import { updateLandingScreenBannerVisibility } from "./actions";

export const LANDING_SCREEN_BANNERS_ENABLED_MAP = {
  ITW_DISCOVERY: true,
  SETTINGS_DISCOVERY: true
} as const;

export type LandingScreenBannerId =
  keyof typeof LANDING_SCREEN_BANNERS_ENABLED_MAP;
export type LandingScreenBannerState = {
  [key in LandingScreenBannerId]: boolean;
};

export const landingScreenBannersReducer = (
  state: LandingScreenBannerState = LANDING_SCREEN_BANNERS_ENABLED_MAP,
  action: Action
) => {
  switch (action.type) {
    case getType(updateLandingScreenBannerVisibility):
      return {
        ...state,
        [action.payload.id]: action.payload.enabled
      };
  }
  return state;
};
