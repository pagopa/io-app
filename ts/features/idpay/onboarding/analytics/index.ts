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
