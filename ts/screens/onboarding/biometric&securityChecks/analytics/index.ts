import { mixpanelTrack } from "../../../../mixpanel";
import { FlowType, buildEventProperties } from "../../../../utils/analytics";

export function trackPinEducationalScreen() {
  void mixpanelTrack(
    "ONBOARDING_EDU_PIN",
    buildEventProperties("UX", "screen_view")
  );
}

export function trackBiometricConfigurationEducationalScreen() {
  void mixpanelTrack(
    "ONBOARDING_EDU_BIOMETRIC_CONFIGURATION",
    buildEventProperties("UX", "screen_view")
  );
}

export function trackBiometricActivationEducationalScreen() {
  void mixpanelTrack(
    "ONBOARDING_EDU_BIOMETRIC_ACTIVATION",
    buildEventProperties("UX", "screen_view")
  );
}

export function trackBiometricActivationAccepted(flow: FlowType) {
  void mixpanelTrack(
    "PREFERENCE_BIOMETRIC_ACTIVATION_ACCEPTED",
    buildEventProperties("UX", "action", undefined, flow)
  );
}

export function trackBiometricActivationDeclined(flow: FlowType) {
  void mixpanelTrack(
    "PREFERENCE_BIOMETRIC_ACTIVATION_DECLINED",
    buildEventProperties("UX", "action", undefined, flow)
  );
}
