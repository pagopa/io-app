import { createSelector, createStructuredSelector } from "reselect";
import { GlobalState } from "../../../store/reducers/types";
import { renderabilitySelectorsFromBannerMap } from "../utils";
import {
  LandingScreenBannerId,
  landingScreenBannerMap
} from "../utils/landingScreenBannerMap";
import { landingScreenBannerOrderSelector } from "../../../store/reducers/backendStatus/remoteConfig";

export const localBannerVisibilitySelector = (state: GlobalState) =>
  state.features.landingBanners;

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
    localBannerVisibilitySelector,
    unifiedRenderabilitySelectors
  ],
  (
    backendBannerOrder,
    isLocalEnabledById,
    isRenderableById
  ): LandingScreenBannerId | undefined => {
    const availableBanners = backendBannerOrder.filter(
      (id): id is LandingScreenBannerId =>
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
