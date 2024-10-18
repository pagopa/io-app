import { getType } from "typesafe-actions";

import { Action } from "../../../store/actions/types";
import { updateLandingScreenBannerVisibility } from "./actions";

const localEnabledMap = {
  ITW_DISCOVERY: true,
  SETTINGS_DISCOVERY: true
} as const;

export type LandingScreenBannerId = keyof typeof localEnabledMap;
export type LandingScreenBannerState = {
  [key in LandingScreenBannerId]: boolean;
};

export const landingScreenBannersReducer = (
  state: LandingScreenBannerState = localEnabledMap,
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
