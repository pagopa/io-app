import * as React from "react";
import { SettingsDiscoveryBanner } from "../../../screens/profile/components/SettingsDiscoveryBanner";
import { GlobalState } from "../../../store/reducers/types";
import { ItwDiscoveryBanner } from "../../itwallet/common/components/ItwDiscoveryBanner";
import { LandingScreenBannerId } from "../store/reducer";
import { isItwDiscoveryBannerRenderableSelector } from "./bannerRenderableSelectors";

type ComponentWithCloseHandler = (
  closeHandler: () => void
) => React.ReactElement;
type ComponentAndLogic = {
  component: ComponentWithCloseHandler;
  isRenderableSelector: (state: GlobalState) => boolean;
};

export type BannerMapById = {
  [key in LandingScreenBannerId]: ComponentAndLogic;
};
export const landingScreenBannerMap: BannerMapById = {
  ITW_DISCOVERY: {
    component: closeHandler => (
      <ItwDiscoveryBanner closable handleOnClose={closeHandler} />
    ),
    isRenderableSelector: isItwDiscoveryBannerRenderableSelector
  },
  SETTINGS_DISCOVERY: {
    component: closeHandler => (
      <SettingsDiscoveryBanner handleOnClose={closeHandler} />
    ),
    isRenderableSelector: _state => true
  }
} as const;
