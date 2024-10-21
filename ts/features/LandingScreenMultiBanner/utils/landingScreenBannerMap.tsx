import * as React from "react";
import { SettingsDiscoveryBanner } from "../../../screens/profile/components/SettingsDiscoveryBanner";
import { isItwEnabledSelector } from "../../../store/reducers/backendStatus";
import { GlobalState } from "../../../store/reducers/types";
import { ItwDiscoveryBanner } from "../../itwallet/common/components/ItwDiscoveryBanner";
import { itwLifecycleIsValidSelector } from "../../itwallet/lifecycle/store/selectors";
import { isItwTrialActiveSelector } from "../../trialSystem/store/reducers";
import { LandingScreenBannerId } from "../store/reducer";

// ---------------------------- UTILS --------------------------------------------
const discoveryBannerRenderableSelector = (state: GlobalState) =>
  isItwTrialActiveSelector(state) ||
  !itwLifecycleIsValidSelector(state) ||
  isItwEnabledSelector(state);

// ---------------------------- COMPONENT MAP ----------------------------------------------
type ComponentWithCloseHandler = (
  closeHandler: () => void
) => React.ReactElement;
type ComponentAndLogic = {
  component: ComponentWithCloseHandler;
  isRenderableSelector: (state: GlobalState) => boolean;
};

export const landingScreenBannerMap: {
  [key in LandingScreenBannerId]: ComponentAndLogic;
} = {
  ITW_DISCOVERY: {
    component: closeHandler => (
      <ItwDiscoveryBanner closable handleOnClose={closeHandler} />
    ),
    isRenderableSelector: discoveryBannerRenderableSelector
  },
  SETTINGS_DISCOVERY: {
    component: closeHandler => (
      <SettingsDiscoveryBanner handleOnClose={closeHandler} />
    ),
    isRenderableSelector: _state => true
  }
} as const;
