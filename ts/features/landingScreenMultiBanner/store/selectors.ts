import { createSelector, createStructuredSelector } from "reselect";
import { GlobalState } from "../../../store/reducers/types";
import { renderabilitySelectorsFromBannerMap } from "../utils";
import {
  LANDING_SCREEN_BANNERS_ENABLED_MAP,
  LandingScreenBannerId,
  landingScreenBannerMap
} from "../utils/landingScreenBannerMap";
import { landingScreenBannerOrderSelector } from "../../../store/reducers/backendStatus/remoteConfig";

export const localSessionBannerVisibilitySelector = (state: GlobalState) =>
  state.features.landingBanners.session;

type StructuredSelectorOutput = {
  [key in LandingScreenBannerId]: boolean;
};

//    unify them so that we have a single selector,
//    which returns a map like { bannerId: renderable(T/F) }
const unifiedRenderabilitySelectors = createStructuredSelector<
  GlobalState,
  StructuredSelectorOutput
>(renderabilitySelectorsFromBannerMap(landingScreenBannerMap));

//  add that as a dependency to the main selector, in order to avoid unnecessary reruns
export const landingScreenBannerToRenderSelector = createSelector(
  [
    landingScreenBannerOrderSelector,
    localSessionBannerVisibilitySelector,
    unifiedRenderabilitySelectors
  ],
  (
    backendBannerOrder,
    isLocalEnabledById,
    isRenderableById
  ): LandingScreenBannerId | undefined => {
    const availableBanners = backendBannerOrder.filter(
      (id): id is LandingScreenBannerId =>
        // since a banner could be set to "persistent enable",
        // we need to double check if it has been enabled in the banner_map, as there may be mismatchings
        LANDING_SCREEN_BANNERS_ENABLED_MAP[id as LandingScreenBannerId] ===
          true &&
        isLocalEnabledById[id as LandingScreenBannerId] === true &&
        isRenderableById[id as LandingScreenBannerId] === true
    );
    return availableBanners[0]; // id || undefined
  }
);

if (process.env.NODE_ENV === "test") {
  // eslint-disable-next-line functional/immutable-data
  module.exports.unifiedRenderability = unifiedRenderabilitySelectors;
}
