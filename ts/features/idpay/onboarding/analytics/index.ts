import * as O from "fp-ts/lib/Option";
import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { OnboardingFailureEnum } from "../types/OnboardingFailure";

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

const mapOptionToReason = (
  reason: O.Option<OnboardingFailureEnum>
): OnboardingFailureEnum =>
  O.isSome(reason)
    ? reason.value
    : OnboardingFailureEnum.ONBOARDING_GENERIC_ERROR;

export const trackIDPayOnboardingFailure = (
  props: DefaultOnboardingEventProperties & {
    reason: O.Option<OnboardingFailureEnum>;
  }
) => {
  mixpanelTrack(
    "IDPAY_ONBOARDING_ERROR",
    buildEventProperties("KO", "screen_view", {
      ...props,
      reason: mapOptionToReason(props.reason)
    })
  );
};

export const trackIDPayOnboardingErrorHelp = (
  props: DefaultOnboardingEventProperties & {
    flow: "onboarding" | "authorization";
    reason: O.Option<OnboardingFailureEnum>;
  }
) => {
  mixpanelTrack(
    "IDPAY_ERROR_HELP",
    buildEventProperties("UX", "action", {
      ...props,
      reason: mapOptionToReason(props.reason)
    })
  );
};

export const trackIDPayIngressScreenLoading = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_INGRESS_SCREEN",
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackIDPayIngressScreenTimeout = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_INGRESS_TIMEOUT",
    buildEventProperties("KO", "screen_view", props)
  );
};

export const trackIDPayIngressScreenCTA = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_INGRESS_TIMEOUT_GO_TO_WEBSITE",
    buildEventProperties("UX", "action", props)
  );
};
