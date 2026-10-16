import { mixpanelTrack } from "../../../../mixpanel";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import {
  trackLandingScreenMultiBannerClosure,
  trackLandingScreenMultiBannerImpression,
  trackLandingScreenMultiBannerTap
} from "../tracking";

jest.mock("../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

describe("landing screen multi-banner tracking", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    {
      name: "impression",
      track: trackLandingScreenMultiBannerImpression,
      eventName: "BANNER",
      eventType: "screen_view"
    },
    {
      name: "tap",
      track: trackLandingScreenMultiBannerTap,
      eventName: "TAP_BANNER",
      eventType: "action"
    },
    {
      name: "closure",
      track: trackLandingScreenMultiBannerClosure,
      eventName: "CLOSE_BANNER",
      eventType: "action"
    }
  ])("should track the banner $name", ({ track, eventName, eventType }) => {
    const bannerId = "BANNER_ID";
    const bannerLanding = "https://example.com/landing";

    expect(mixpanelTrack).not.toHaveBeenCalled();
    track(bannerId, bannerLanding);

    expect(mixpanelTrack).toHaveBeenCalledWith(eventName, {
      event_category: "UX",
      event_type: eventType,
      banner_id: bannerId,
      banner_page: MESSAGES_ROUTES.MESSAGES_HOME,
      banner_landing: bannerLanding
    });
  });
});
