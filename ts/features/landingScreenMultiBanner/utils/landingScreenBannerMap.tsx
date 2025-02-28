import { ReactElement } from "react";
import { SettingsDiscoveryBanner } from "../../../screens/profile/components/SettingsDiscoveryBanner";
import { GlobalState } from "../../../store/reducers/types";
import { ItwDiscoveryBanner } from "../../itwallet/common/components/discoveryBanner/ItwDiscoveryBanner";
import { isItwPersistedDiscoveryBannerRenderableSelector } from "../../itwallet/common/store/selectors";
import { LoginExpirationBanner } from "../../login/preferences/components/LoginExpirationBanner";
import { isSessionExpirationBannerRenderableSelector } from "../../login/preferences/store/selectors";
import { PNActivationReminderBanner } from "../../pn/components/PNActivationReminderBanner";
import { hasUserAcknowledgedSettingsBannerSelector } from "../../profileSettings/store/selectors";
import { PushNotificationsBanner } from "../../pushNotifications/components/PushNotificationsBanner";
import { isPushNotificationsBannerRenderableSelector } from "../../pushNotifications/store/selectors";

type ComponentWithCloseHandler = (closeHandler: () => void) => ReactElement;
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
  SETTINGS_DISCOVERY: true,
  LV_EXPIRATION_REMINDER: true,
  SEND_ACTIVATION_REMINDER: false
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
  },
  LV_EXPIRATION_REMINDER: {
    component: closeHandler => (
      <LoginExpirationBanner handleOnClose={closeHandler} />
    ),
    isRenderableSelector: isSessionExpirationBannerRenderableSelector
  },
  SEND_ACTIVATION_REMINDER: {
    component: closeHandler => (
      <PNActivationReminderBanner handleOnClose={closeHandler} />
    ),
    isRenderableSelector: _state => true
  }
} as const;
