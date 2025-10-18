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

export const trackIDPayOnboardingNotificationCancel = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_SERVICE_NOTIFICATION_DENIED",
    buildEventProperties("UX", "action", props)
  );
};

export const trackIDPayOnboardingNotificationError = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_SERVICE_NOTIFICATION_ERROR",
    buildEventProperties("KO", "screen_view", props)
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

export const trackIDPayOnboardingAlert = (
  props: DefaultOnboardingEventProperties & {
    screen: "intent_declaration" | "multi_self_declaration";
  }
) => {
  mixpanelTrack(
    "IDPAY_ONBOARDING_ALERT",
    buildEventProperties("KO", "screen_view", props)
  );
};

export const trackIDPayOnboardingPDNDAcceptance = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_ONBOARDING_PDND_ACCEPTANCE",
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackIDPayOnboardingSelfDeclaration = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_ONBOARDING_INTENT_DECLARATION",
    buildEventProperties("UX", "screen_view", props)
  );
};
export const trackIDPayOnboardingMultiSelfDeclaration = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_ONBOARDING_MULTI_SELF_DECLARATION",
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackIDPayOnboardingConversionRate = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_ONBOARDING_UX_CONVERSION",
    buildEventProperties("TECH", undefined, props)
  );
};

export const trackIDPayOnboardingSuccess = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_ONBOARDING_UX_SUCCESS",
    buildEventProperties("UX", "confirm", props)
  );
};

export const trackIDPayOnboardingNotificationDenied = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_SYSTEM_NOTIFICATION_DENIED",
    buildEventProperties("UX", "action", props)
  );
};

export const trackIDPayOnboardingNotificationActivation = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_SYSTEM_NOTIFICATION_ACTIVATION",
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackIDPayOnboardingNotificationAccepted = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_SYSTEM_NOTIFICATION_ACCEPTED",
    buildEventProperties("UX", "action", props)
  );
};

export const trackIDPayOnboardingNotificationSuccess = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "IDPAY_SYSTEM_NOTIFICATION_ACTIVATION_UX_SUCCESS",
    buildEventProperties("UX", "confirm", props)
  );
};

export const trackIDPayOnboardingEmailActivationError = () => {
  mixpanelTrack(
    "IDPAY_EMAIL_ACTIVATION_ERROR",
    buildEventProperties("KO", "screen_view")
  );
};

export const trackIDPayOnboardingEmailActivationSuccess = () => {
  mixpanelTrack(
    "IDPAY_EMAIL_ACTIVATION_UX_SUCCESS",
    buildEventProperties("UX", "confirm")
  );
};

export const trackIDPayOnboardingAppUpdateRequired = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "APP_UPDATE_REQUESTED",
    buildEventProperties("UX", "screen_view", { ...props, flow: "idpay" })
  );
};
export const trackIDPayOnboardingAppUpdateConfirm = (
  props: DefaultOnboardingEventProperties
) => {
  mixpanelTrack(
    "APP_UPDATE_REQUESTED",
    buildEventProperties("UX", "action", { ...props, flow: "idpay" })
  );
};
