import { mixpanelTrack } from "../../../../../mixpanel";
import { buildEventProperties, FlowType } from "../../../../../utils/analytics";

export function trackBiometricActivationEducationalScreen(flow: FlowType) {
  void mixpanelTrack(
    "ONBOARDING_EDU_BIOMETRIC_ACTIVATION",
    buildEventProperties("UX", "screen_view", undefined, flow)
  );
}

export function trackBiometricConfigurationEducationalScreen(flow: FlowType) {
  void mixpanelTrack(
    "ONBOARDING_EDU_BIOMETRIC_CONFIGURATION",
    buildEventProperties("UX", "screen_view", undefined, flow)
  );
}

export function trackPinEducationalScreen(flow: FlowType) {
  void mixpanelTrack(
    "ONBOARDING_EDU_PIN_CONFIGURATION",
    buildEventProperties("UX", "screen_view", undefined, flow)
  );
}
