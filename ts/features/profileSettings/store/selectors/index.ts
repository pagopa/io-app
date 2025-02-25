import { GlobalState } from "../../../../store/reducers/types";

export const hasUserAcknowledgedSettingsBannerSelector = (state: GlobalState) =>
  state.features.profileSettings.hasUserAcknowledgedSettingsBanner;
