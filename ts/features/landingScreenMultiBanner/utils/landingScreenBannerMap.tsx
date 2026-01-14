import { ReactElement } from "react";
import { GlobalState } from "../../../store/reducers/types";
import { LoginExpirationBanner } from "../../authentication/activeSessionLogin/components/LoginExpirationBanner";
import { showSessionExpirationBannerRenderableSelector } from "../../authentication/activeSessionLogin/store/selectors";
import { ItwDiscoveryBannerLegacy } from "../../itwallet/common/components/discoveryBanner/ItwDiscoveryBanner";
import {
  isItwPersistedDiscoveryBannerRenderableSelector,
  itwShouldRenderDiscoveryBannerSelector
} from "../../itwallet/common/store/selectors";
import { ItwDiscoveryBanner } from "../../itwallet/discovery/components/ItwDiscoveryBanner";
import { PNActivationReminderBanner } from "../../pn/reminderBanner/components/PNActivationReminderBanner";
import { isPnActivationReminderBannerRenderableSelector } from "../../pn/reminderBanner/reducer/bannerDismiss";
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
  IT_WALLET_DISCOVERY: true,
  ITW_DISCOVERY: true /** Legacy Documenti su IO */,
  LV_EXPIRATION_REMINDER: true,
  SEND_ACTIVATION_REMINDER: true
} as const;

export const landingScreenBannerMap: BannerMapById = {
  PUSH_NOTIFICATIONS_REMINDER: {
    component: closeHandler => (
      <PushNotificationsBanner closeHandler={closeHandler} />
    ),
    isRenderableSelector: isPushNotificationsBannerRenderableSelector
  },
  IT_WALLET_DISCOVERY: {
    component: closeHandler => (
      <ItwDiscoveryBanner
        style={{ marginHorizontal: 24, marginVertical: 16 }}
        onDismiss={closeHandler}
      />
    ),
    isRenderableSelector: itwShouldRenderDiscoveryBannerSelector
  },
  ITW_DISCOVERY: {
    component: closeHandler => (
      <ItwDiscoveryBannerLegacy closable handleOnClose={closeHandler} />
    ),
    isRenderableSelector: isItwPersistedDiscoveryBannerRenderableSelector
  },
  LV_EXPIRATION_REMINDER: {
    component: closeHandler => (
      <LoginExpirationBanner handleOnClose={closeHandler} />
    ),
    isRenderableSelector: showSessionExpirationBannerRenderableSelector
  },
  SEND_ACTIVATION_REMINDER: {
    component: closeHandler => (
      <PNActivationReminderBanner handleOnClose={closeHandler} />
    ),
    isRenderableSelector: isPnActivationReminderBannerRenderableSelector
  }
} as const;
