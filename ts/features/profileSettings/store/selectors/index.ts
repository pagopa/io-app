import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";

const profileSettingsSelector = (state: GlobalState) =>
  state.features.profileSettings;

export const showProfileBannerSelector = createSelector(
  profileSettingsSelector,
  ({ showProfileBanner }) => showProfileBanner
);
