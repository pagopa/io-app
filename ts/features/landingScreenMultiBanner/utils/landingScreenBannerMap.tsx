import * as React from "react";
import { SettingsDiscoveryBanner } from "../../../screens/profile/components/SettingsDiscoveryBanner";
import { GlobalState } from "../../../store/reducers/types";
import { ItwDiscoveryBanner } from "../../itwallet/common/components/discoveryBanner/ItwDiscoveryBanner";
import { isItwPersistedDiscoveryBannerRenderableSelector } from "../../itwallet/common/store/selectors";
import { hasUserAcknowledgedSettingsBannerSelector } from "../../profileSettings/store/selectors";
import { PushNotificationsBanner } from "../../pushNotifications/components/PushNotificationsBanner";
import { isPushNotificationsBannerRenderableSelector } from "../../pushNotifications/store/selectors";

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
export type LandingScreenBannerId =
  keyof typeof LANDING_SCREEN_BANNERS_ENABLED_MAP;

export const LANDING_SCREEN_BANNERS_ENABLED_MAP = {
  PUSH_NOTIFICATIONS_REMINDER: true,
  ITW_DISCOVERY: true,
  SETTINGS_DISCOVERY: true
} as const;

export const landingScreenBannerMap: BannerMapById = {
  PUSH_NOTIFICATIONS_REMINDER: {
    component: closeHandler => (
      <PushNotificationsBanner closeHandler={closeHandler} />
    ),
    isRenderableSelector: isPushNotificationsBannerRenderableSelector
  },
  ITW_DISCOVERY: {
    component: closeHandler => (
      <ItwDiscoveryBanner closable handleOnClose={closeHandler} />
    ),
    isRenderableSelector: isItwPersistedDiscoveryBannerRenderableSelector
  },
  SETTINGS_DISCOVERY: {
    component: closeHandler => (
      <SettingsDiscoveryBanner handleOnClose={closeHandler} />
    ),
    isRenderableSelector: (state: GlobalState) =>
      !hasUserAcknowledgedSettingsBannerSelector(state)
  }
} as const;
