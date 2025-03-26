import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import PN_ROUTES from "../../navigation/routes";
import { sendBannerMixpanelEvents } from "../activationReminderBanner";

jest.mock("../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

jest.mock("../../../../utils/analytics", () => ({
  buildEventProperties: jest
    .fn()
    .mockImplementation((channel, category, properties) => ({
      channel,
      category,
      properties
    }))
}));

describe("activationReminderBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should track banner shown event", () => {
    sendBannerMixpanelEvents.bannerShown();

    expect(mixpanelTrack).toHaveBeenCalledWith(
      "BANNER",
      buildEventProperties("UX", "screen_view", {
        banner_id: "SEND_ACTIVATION_REMINDER",
        banner_page: MESSAGES_ROUTES.MESSAGES_HOME,
        banner_landing: PN_ROUTES.ACTIVATION_BANNER_FLOW
      })
    );
  });

  it("should track banner tap event", () => {
    sendBannerMixpanelEvents.bannerTap();

    expect(mixpanelTrack).toHaveBeenCalledWith(
      "TAP_BANNER",
      buildEventProperties("UX", "action", {
        banner_id: "SEND_ACTIVATION_REMINDER",
        banner_page: MESSAGES_ROUTES.MESSAGES_HOME,
        banner_landing: PN_ROUTES.ACTIVATION_BANNER_FLOW
      })
    );
  });

  it("should track banner close event", () => {
    sendBannerMixpanelEvents.bannerClose();

    expect(mixpanelTrack).toHaveBeenCalledWith(
      "CLOSE_BANNER",
      buildEventProperties("UX", "action", {
        banner_id: "SEND_ACTIVATION_REMINDER",
        banner_page: MESSAGES_ROUTES.MESSAGES_HOME,
        banner_landing: PN_ROUTES.ACTIVATION_BANNER_FLOW
      })
    );
  });

  it("should track banner KO event with reason", () => {
    const testReason = "network_error";
    sendBannerMixpanelEvents.bannerKO(testReason);

    expect(mixpanelTrack).toHaveBeenCalledWith(
      "SEND_ACTIVATION_FAILURE",
      buildEventProperties("KO", "error", {
        reason: testReason
      })
    );
  });

  it("should track already active event", () => {
    sendBannerMixpanelEvents.alreadyActive();

    expect(mixpanelTrack).toHaveBeenCalledWith(
      "SEND_ALREADY_ACTIVE",
      buildEventProperties("UX", "screen_view")
    );
  });

  it("should track activation success event", () => {
    sendBannerMixpanelEvents.activationSuccess();

    expect(mixpanelTrack).toHaveBeenCalledWith(
      "SEND_BANNER_ACTIVATION_UX_SUCCESS",
      buildEventProperties("UX", "screen_view")
    );
  });

  it("should track activation start event", () => {
    sendBannerMixpanelEvents.activationStart();

    expect(mixpanelTrack).toHaveBeenCalledWith(
      "SEND_BANNER_ACTIVATION_START",
      buildEventProperties("UX", "action")
    );
  });
});
