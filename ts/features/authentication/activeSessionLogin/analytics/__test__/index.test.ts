import {
  trackLoginExpirationBannerPrompt,
  trackLoginExpirationBannerTap,
  trackLoginExpirationBannerClosure,
  BANNER_ID
} from "../../analytics";
import { helpCenterHowToDoWhenSessionIsExpiredUrl } from "../../../../../config";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import * as analyticsUtils from "../../../../../utils/analytics";
import * as mixpanel from "../../../../../mixpanel";

jest.mock("../../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

jest.mock("../../../../../utils/analytics", () => ({
  buildEventProperties: jest.fn()
}));

describe("Login Expiration Banner analytics", () => {
  const expectedProps = {
    banner_id: BANNER_ID,
    banner_page: MESSAGES_ROUTES.MESSAGES_HOME,
    banner_landing: helpCenterHowToDoWhenSessionIsExpiredUrl,
    banner_campaign: "LV"
  };

  it("should track banner prompt correctly", () => {
    const mockProps = { mock: "data" };
    (analyticsUtils.buildEventProperties as jest.Mock).mockReturnValue(
      mockProps
    );

    trackLoginExpirationBannerPrompt(helpCenterHowToDoWhenSessionIsExpiredUrl);

    expect(analyticsUtils.buildEventProperties).toHaveBeenCalledWith(
      "UX",
      "screen_view",
      expectedProps
    );
    expect(mixpanel.mixpanelTrack).toHaveBeenCalledWith("BANNER", mockProps);
  });

  it("should track banner tap correctly", () => {
    const mockProps = { mock: "tap" };
    (analyticsUtils.buildEventProperties as jest.Mock).mockReturnValue(
      mockProps
    );

    trackLoginExpirationBannerTap(helpCenterHowToDoWhenSessionIsExpiredUrl);

    expect(analyticsUtils.buildEventProperties).toHaveBeenCalledWith(
      "UX",
      "action",
      expectedProps
    );
    expect(mixpanel.mixpanelTrack).toHaveBeenCalledWith(
      "TAP_BANNER",
      mockProps
    );
  });

  it("should track banner closure correctly", () => {
    const mockProps = { mock: "closure" };
    (analyticsUtils.buildEventProperties as jest.Mock).mockReturnValue(
      mockProps
    );

    trackLoginExpirationBannerClosure(helpCenterHowToDoWhenSessionIsExpiredUrl);

    expect(analyticsUtils.buildEventProperties).toHaveBeenCalledWith(
      "UX",
      "action",
      expectedProps
    );
    expect(mixpanel.mixpanelTrack).toHaveBeenCalledWith(
      "CLOSE_BANNER",
      mockProps
    );
  });
});
