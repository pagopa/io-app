import { GlobalState } from "../../../../store/reducers/types";

export const showProfileBannerSelector = (state: GlobalState) =>
  state.features.profileSettings.showProfileBanner;
