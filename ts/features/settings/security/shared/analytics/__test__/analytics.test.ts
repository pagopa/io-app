import {
  trackBiometricActivationAccepted,
  trackBiometricActivationDeclined
} from "..";
import { mixpanelTrack } from "../../../../../../mixpanel";

jest.mock("../../../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));
jest.mock("../../../../../../mixpanelConfig/profileProperties", () => ({
  updateMixpanelProfileProperties: jest.fn()
}));

describe("Biometric track", () => {
  const flow = "firstOnboarding";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should track biometric activation declined", () => {
    trackBiometricActivationDeclined(flow);
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "PREFERENCE_BIOMETRIC_ACTIVATION_DECLINED",
      expect.objectContaining({
        event_category: "UX",
        event_type: "action",
        flow
      })
    );
  });

  it("should track biometric activation accepted", () => {
    trackBiometricActivationAccepted(flow);
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "PREFERENCE_BIOMETRIC_ACTIVATION_ACCEPTED",
      expect.objectContaining({
        event_category: "UX",
        event_type: "action",
        flow
      })
    );
  });
});
