// __tests__/tosAnalytics.test.ts
import {
  trackToSWebViewError,
  trackToSWebViewErrorRetry,
  trackTosScreen,
  trackTosAccepted
} from "..";
import { mixpanelTrack } from "../../../../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../../../../mixpanelConfig/profileProperties";
import { GlobalState } from "../../../../../../store/reducers/types";

jest.mock("../../../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));
jest.mock("../../../../../../mixpanelConfig/profileProperties", () => ({
  updateMixpanelProfileProperties: jest.fn()
}));

describe("ToS Analytics", () => {
  const mockState = {} as GlobalState;
  const flow = "firstOnboarding";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should track TOS load error", () => {
    trackToSWebViewError(flow);
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "TOS_LOAD_FAILURE",
      expect.objectContaining({
        event_category: "KO",
        flow
      })
    );
  });

  it("should track TOS load retry", () => {
    trackToSWebViewErrorRetry(flow);
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "TOS_LOAD_RETRY",
      expect.objectContaining({
        event_category: "UX",
        event_type: "action",
        flow
      })
    );
  });

  it("should track TOS screen view", () => {
    trackTosScreen(flow);
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "TOS",
      expect.objectContaining({
        event_category: "UX",
        event_type: "screen_view",
        flow
      })
    );
  });

  it("should track TOS accepted and update profile property", async () => {
    const version = 5;
    await trackTosAccepted(version, flow, mockState);

    expect(updateMixpanelProfileProperties).toHaveBeenCalledWith(mockState, {
      property: "TOS_ACCEPTED_VERSION",
      value: version
    });

    expect(mixpanelTrack).toHaveBeenCalledWith(
      "TOS_ACCEPTED",
      expect.objectContaining({
        event_category: "UX",
        event_type: "action",
        acceptedTosVersion: version,
        flow
      })
    );
  });
});
