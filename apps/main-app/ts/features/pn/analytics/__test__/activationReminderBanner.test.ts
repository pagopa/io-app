import { mixpanelTrack } from "../../../../mixpanel";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { SendFailureReason } from "../../../messages/utils";
import PN_ROUTES from "../../navigation/routes";
import { sendBannerMixpanelEvents } from "../activationReminderBanner";

jest.mock("../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

const testBuildEventProperties = (
  category: string,
  type: string,
  properties?: Record<string, unknown>
) => ({
  event_category: category,
  event_type: type,
  ...properties
});

describe("activationReminderBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should track banner shown event", () => {
    sendBannerMixpanelEvents.bannerShown();

    expect(mixpanelTrack).toHaveBeenCalledWith(
      "BANNER",
      testBuildEventProperties("UX", "screen_view", {
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
      testBuildEventProperties("UX", "action", {
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
      testBuildEventProperties("UX", "action", {
        banner_id: "SEND_ACTIVATION_REMINDER",
        banner_page: MESSAGES_ROUTES.MESSAGES_HOME,
        banner_landing: PN_ROUTES.ACTIVATION_BANNER_FLOW
      })
    );
  });

  it("should track banner KO event with type only", () => {
    sendBannerMixpanelEvents.bannerKO("MISSING-SID");

    expect(mixpanelTrack).toHaveBeenCalledWith(
      "SEND_ACTIVATION_FAILURE",
      testBuildEventProperties("KO", "error", {
        type: "MISSING-SID",
        reason: undefined
      })
    );
  });

  it("should track banner KO event with type and a reason", () => {
    const testReason = SendFailureReason.NETWORK_ERROR;
    sendBannerMixpanelEvents.bannerKO("FAILURE_ACTIVATION", testReason);

    expect(mixpanelTrack).toHaveBeenCalledWith(
      "SEND_ACTIVATION_FAILURE",
      testBuildEventProperties("KO", "error", {
        type: "FAILURE_ACTIVATION",
        reason: testReason
      })
    );
  });

  it("should track already active event", () => {
    sendBannerMixpanelEvents.alreadyActive();

    expect(mixpanelTrack).toHaveBeenCalledWith(
      "SEND_ALREADY_ACTIVE",
      testBuildEventProperties("UX", "screen_view")
    );
  });

  it("should track activation success event", () => {
    sendBannerMixpanelEvents.activationSuccess();

    expect(mixpanelTrack).toHaveBeenCalledWith(
      "SEND_BANNER_ACTIVATION_UX_SUCCESS",
      testBuildEventProperties("UX", "screen_view")
    );
  });

  it("should track activation start event", () => {
    sendBannerMixpanelEvents.activationStart();

    expect(mixpanelTrack).toHaveBeenCalledWith(
      "SEND_BANNER_ACTIVATION_START",
      testBuildEventProperties("UX", "action")
    );
  });
});
