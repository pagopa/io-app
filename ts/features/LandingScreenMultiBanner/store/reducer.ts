import { getType } from "typesafe-actions";

import { Action } from "../../../store/actions/types";
import {
  LANDING_SCREEN_BANNERS_ENABLED_MAP,
  LandingScreenBannerId
} from "../utils/landingScreenBannerMap";
import { updateLandingScreenBannerVisibility } from "./actions";

export type LandingScreenBannerState = {
  [key in LandingScreenBannerId]: boolean;
};

const INITIAL_STATE = LANDING_SCREEN_BANNERS_ENABLED_MAP;

export const landingScreenBannersReducer = (
  state: LandingScreenBannerState = INITIAL_STATE,
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
