import { createSelector, createStructuredSelector } from "reselect";

import { landingScreenBannerOrderSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../store/reducers/types";
import { renderabilitySelectorsFromBannerMap } from "../utils";
import {
  LandingScreenBannerId,
  landingScreenBannerMap
} from "../utils/landingScreenBannerMap";

export const localBannerVisibilitySelector = (state: GlobalState) =>
  state.features.landingBanners;

export type LandingScreenBannerToRender =
  | { id: LandingScreenBannerId; type: "banner" }
  | { type: "loading" }
  | { type: "none" };

type StructuredSelectorOutput = {
  [key in LandingScreenBannerId]: boolean | undefined;
};

const NO_BANNER: LandingScreenBannerToRender = { type: "none" };
const LOADING_BANNER: LandingScreenBannerToRender = { type: "loading" };

//    unify them so that we have a single selector,
//    which returns a map like { bannerId: renderable(T/F/undefined) }
const unifiedRenderabilitySelectors = createStructuredSelector<
  GlobalState,
  StructuredSelectorOutput
>(renderabilitySelectorsFromBannerMap(landingScreenBannerMap));

/**
 * Picks the first renderable banner following the remote priority order. While
 * a higher priority banner renderability is still unknown (`undefined`), it
 * returns `loading` so that the lower priority one is not shown and then
 * swapped out.
 */
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
  ): LandingScreenBannerToRender => {
    const enabledBanners = backendBannerOrder.filter(
      (id): id is LandingScreenBannerId =>
        isLocalEnabledById[id as LandingScreenBannerId] === true
    );
    const bannerIndex = enabledBanners.findIndex(
      id => isRenderableById[id] === true
    );
    if (bannerIndex === -1) {
      return NO_BANNER;
    }
    const isHigherPriorityBannerLoading = enabledBanners
      .slice(0, bannerIndex)
      // ids unknown to the banner map (e.g. removed banners) are ignored
      .some(id => id in isRenderableById && isRenderableById[id] === undefined);
    return isHigherPriorityBannerLoading
      ? LOADING_BANNER
      : { type: "banner", id: enabledBanners[bannerIndex] };
  }
);

if (process.env.NODE_ENV === "test") {
  // eslint-disable-next-line functional/immutable-data
  module.exports.unifiedRenderability = unifiedRenderabilitySelectors;
}
