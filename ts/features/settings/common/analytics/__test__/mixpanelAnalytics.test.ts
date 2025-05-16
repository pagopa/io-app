import { mixpanelTrack } from "../../../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../../../mixpanelConfig/profileProperties";
import { FlowType } from "../../../../../utils/analytics";
import {
  TrackingInfo,
  trackMixpanelDeclined,
  trackMixpanelSetEnabled,
  trackMixPanelTrackingInfo
} from "../mixpanel/mixpanelAnalytics";

jest.mock("../../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

jest.mock("../../../../../mixpanelConfig/profileProperties", () => ({
  updateMixpanelProfileProperties: jest.fn()
}));

describe("trackMixpanelSetEnabled", () => {
  const mockState = {} as any; // o crea uno stato fittizio coerente
  const flow: FlowType = "onBoarding";

  it("should track accepted state", async () => {
    await trackMixpanelSetEnabled(true, flow, mockState);

    expect(updateMixpanelProfileProperties).toHaveBeenCalledWith(mockState, {
      property: "TRACKING",
      value: "accepted"
    });

    expect(mixpanelTrack).toHaveBeenCalledWith(
      "MIXPANEL_SET_ENABLED",
      expect.objectContaining({
        event_category: "UX",
        event_type: "action",
        value: true,
        flow
      })
    );
  });

  it("should track declined state", async () => {
    await trackMixpanelSetEnabled(false, flow, mockState);

    expect(updateMixpanelProfileProperties).toHaveBeenCalledWith(mockState, {
      property: "TRACKING",
      value: "declined"
    });

    expect(mixpanelTrack).toHaveBeenCalledWith(
      "MIXPANEL_SET_ENABLED",
      expect.objectContaining({
        event_category: "UX",
        event_type: "action",
        value: false,
        flow
      })
    );
  });
});
describe("trackMixpanelDeclined", () => {
  it("should track preference declined", () => {
    const flow: FlowType = "onBoarding";

    trackMixpanelDeclined(flow);

    expect(mixpanelTrack).toHaveBeenCalledWith(
      "PREFERENCE_MIXPANEL_DECLINED",
      expect.objectContaining({
        event_category: "UX",
        event_type: "action",
        flow
      })
    );
  });
});

describe("trackMixPanelTrackingInfo", () => {
  it("should track tracking info with the correct info type", () => {
    const flow: FlowType = "onBoarding";

    trackMixPanelTrackingInfo(flow, TrackingInfo.SUPPLIERS);

    expect(mixpanelTrack).toHaveBeenCalledWith(
      "TRACKING_INFO",
      expect.objectContaining({
        event_category: "UX",
        event_type: "action",
        info: "fornitori",
        flow
      })
    );
  });
});
