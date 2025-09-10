import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";

type DefaultOnboardingEventProperties = {
  initiativeName?: string;
  initiativeId?: string;
};

export const trackIDPayOnboardingIntro = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_ONBOARDING_INTRO",
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackIDPayOnboardingStart = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_ONBOARDING_START",
    buildEventProperties("UX", "action", props)
  );
};

export const trackIDPayOnboardingNotificationPermission = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_SERVICE_NOTIFICATION_ACTIVATION",
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackIDPayOnboardingNotificationOK = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_SERVICE_NOTIFICATION_ACCEPTED",
    buildEventProperties("UX", "action", props)
  );
};

export const trackIDPayOnboardingNotificationKO = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_SERVICE_NOTIFICATION_DENIED",
    buildEventProperties("UX", "action", props)
  );
};
