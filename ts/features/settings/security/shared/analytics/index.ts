import { mixpanelTrack } from "../../../../../mixpanel";
import { FlowType, buildEventProperties } from "../../../../../utils/analytics";

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
