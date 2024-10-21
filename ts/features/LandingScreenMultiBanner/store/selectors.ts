import { createSelector, createStructuredSelector, Selector } from "reselect";
import { LandingScreenBannerOrderSelector } from "../../../store/reducers/backendStatus";
import { GlobalState } from "../../../store/reducers/types";
import { landingScreenBannerMap } from "../utils/landingScreenBannerMap";
import { LandingScreenBannerId } from "./reducer";

const localBannerVisibilitySelector = (state: GlobalState) =>
  state.features.landingBanners;

type StructuredSelectorOutput = {
  [key in LandingScreenBannerId]: boolean;
};

// 1) extract renderability selectors from component map
const getRenderableSelectorsById = () => {
  const arrayOfObjects = Object.keys(landingScreenBannerMap).map(key => ({
    [key]:
      landingScreenBannerMap[key as LandingScreenBannerId].isRenderableSelector
  }));

  const reduced: {
    [key in LandingScreenBannerId]: Selector<GlobalState, boolean>;
  } = Object.assign({}, ...arrayOfObjects);
  return reduced;
};

// 2) unify them so that we have a single selector,
//    which returns a map like { bannerId: renderable(T/F) }
const unifiedRenderabilitySelectors = createStructuredSelector<
  GlobalState,
  StructuredSelectorOutput
>(getRenderableSelectorsById());

// 3) add it as a dependency to the main selector, in order to avoid unnecessary reruns
export const LandingScreenBannerToRenderSelector = createSelector(
  [
    LandingScreenBannerOrderSelector,
    localBannerVisibilitySelector,
    unifiedRenderabilitySelectors
  ],
  (backendBanners, localVisibility, renderabilityDataById) => {
    const availableBanners = backendBanners.filter(
      (id): id is LandingScreenBannerId =>
        localVisibility[id as LandingScreenBannerId] === true &&
        renderabilityDataById[id as LandingScreenBannerId] === true
    );
    return availableBanners[0]; // id || undefined
  }
);
