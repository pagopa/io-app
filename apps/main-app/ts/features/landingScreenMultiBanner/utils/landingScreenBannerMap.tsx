import { ReactElement } from "react";

import { GlobalState } from "../../../store/reducers/types";
import { LoginExpirationBanner } from "../../authentication/activeSessionLogin/components/LoginExpirationBanner";
import { showSessionExpirationBannerRenderableSelector } from "../../authentication/activeSessionLogin/store/selectors";
import CgnDiscoveryBanner from "../../bonus/cgn/components/CgnDiscoveryBanner";
import { isCgnEngagementBannerRenderableSelector } from "../../bonus/cgn/store/selectors/banners";
import { ItwDiscoveryBannerLegacy } from "../../itwallet/common/components/discoveryBanner/ItwDiscoveryBanner";
import {
  isItwPersistedDiscoveryBannerRenderableSelector,
  itwShouldRenderInboxDiscoveryBannerSelector
} from "../../itwallet/common/store/selectors";
import { ItwDiscoveryBanner } from "../../itwallet/discovery/components/ItwDiscoveryBanner";
import OsDismissionBanner from "../../osDismission/components/OsDismissionBanner";
import { isOsDismissionBannerRenderableSelector } from "../../osDismission/store/selectors";
import { PNActivationReminderBanner } from "../../pn/reminderBanner/components/PNActivationReminderBanner";
import { isPnActivationReminderBannerRenderableSelector } from "../../pn/reminderBanner/reducer/bannerDismiss";
import { PushNotificationsBanner } from "../../pushNotifications/components/PushNotificationsBanner";
import { isPushNotificationsBannerRenderableSelector } from "../../pushNotifications/store/selectors";
import { FseDiscoveryBanner } from "../../services/fseDiscoveryBanner/components/FseDiscoveryBanner";
import { isFseDiscoveryBannerRenderableSelector } from "../../services/fseDiscoveryBanner/store/selectors";

export type BannerMapById = {
  [key in LandingScreenBannerId]: ComponentAndLogic;
};
export type LandingScreenBannerId =
  keyof typeof LANDING_SCREEN_BANNERS_ENABLED_MAP;

type ComponentAndLogic = {
  component: ComponentWithCloseHandler;
  isRenderableSelector: (state: GlobalState) => boolean;
};
type ComponentWithCloseHandler = (closeHandler: () => void) => ReactElement;

export const LANDING_SCREEN_BANNERS_ENABLED_MAP = {
  OS_DISMISSION_REMINDER: true,
  PUSH_NOTIFICATIONS_REMINDER: true,
  IT_WALLET_DISCOVERY: true,
  ITW_DISCOVERY: true /** Legacy Documenti su IO */,
  LV_EXPIRATION_REMINDER: true,
  SEND_ACTIVATION_REMINDER: true,
  CGN_ENGAGEMENT_BANNER: true,
  FSE_ENGAGEMENT_BANNER: true
} as const;

export const landingScreenBannerMap: BannerMapById = {
  OS_DISMISSION_REMINDER: {
    component: closeHandler => (
      <OsDismissionBanner handleOnClose={closeHandler} />
    ),
    isRenderableSelector: isOsDismissionBannerRenderableSelector
  },
  PUSH_NOTIFICATIONS_REMINDER: {
    component: closeHandler => (
      <PushNotificationsBanner closeHandler={closeHandler} />
    ),
    isRenderableSelector: isPushNotificationsBannerRenderableSelector
  },
  IT_WALLET_DISCOVERY: {
    component: closeHandler => (
      <ItwDiscoveryBanner
        flow="messages_inbox"
        onDismiss={closeHandler}
        style={{ marginHorizontal: 24, marginVertical: 16 }}
      />
    ),
    isRenderableSelector: itwShouldRenderInboxDiscoveryBannerSelector
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
  },
  CGN_ENGAGEMENT_BANNER: {
    component: closeHandler => (
      <CgnDiscoveryBanner handleOnClose={closeHandler} />
    ),
    isRenderableSelector: isCgnEngagementBannerRenderableSelector
  },
  FSE_ENGAGEMENT_BANNER: {
    component: closeHandler => (
      <FseDiscoveryBanner handleOnClose={closeHandler} />
    ),
    isRenderableSelector: isFseDiscoveryBannerRenderableSelector
  }
} as const;
