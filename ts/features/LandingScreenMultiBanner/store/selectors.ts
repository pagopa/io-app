import { LandingScreenBannerOrderSelector } from "../../../store/reducers/backendStatus";
import { GlobalState } from "../../../store/reducers/types";
import { LandingScreenBannerId } from "./reducer";

export const LandingScreenBannerToRenderSelector = (state: GlobalState) => {
  const backendBanners = LandingScreenBannerOrderSelector(state);
  return backendBanners?.filter(
    (id): id is LandingScreenBannerId =>
      state.features.LandingBanners[id as LandingScreenBannerId] === true // maybe unnecessary redundancy, but better safe than sorry
  )[0];
};
