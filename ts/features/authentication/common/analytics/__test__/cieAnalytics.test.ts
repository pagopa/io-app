import { mixpanelTrack } from "../../../../../mixpanel";
import { buildEventProperties } from "../../../../../utils/analytics";
import {
  trackLoginCiePinScreen,
  trackLoginCiePinInfo,
  trackLoginCieCardReaderScreen,
  trackLoginCieCardReadingSuccess,
  trackLoginCieConsentDataUsageScreen,
  trackLoginCieCardReadingError,
  trackLoginCieDataSharingError
} from "../cieAnalytics";

jest.mock("../../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

jest.mock("../../../../../utils/analytics", () => ({
  buildEventProperties: jest.fn()
}));

describe("cieAnalytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("tracks LOGIN_CIE_PIN screen view", () => {
    const mockProps = { mock: true };
    (buildEventProperties as jest.Mock).mockReturnValue(mockProps);
    trackLoginCiePinScreen();
    expect(mixpanelTrack).toHaveBeenCalledWith("LOGIN_CIE_PIN", mockProps);
    expect(buildEventProperties).toHaveBeenCalledWith("UX", "screen_view", {
      flow: "auth"
    });
  });

  it("tracks LOGIN_CIE_PIN_INFO action", () => {
    const mockProps = { mock: true };
    (buildEventProperties as jest.Mock).mockReturnValue(mockProps);
    trackLoginCiePinInfo();
    expect(mixpanelTrack).toHaveBeenCalledWith("LOGIN_CIE_PIN_INFO", mockProps);
    expect(buildEventProperties).toHaveBeenCalledWith("UX", "action", {
      flow: "auth"
    });
  });

  it("tracks LOGIN_CIE_CARD_READER screen view", () => {
    const mockProps = { mock: true };
    (buildEventProperties as jest.Mock).mockReturnValue(mockProps);
    trackLoginCieCardReaderScreen();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIE_CARD_READER",
      mockProps
    );
    expect(buildEventProperties).toHaveBeenCalledWith("UX", "screen_view", {
      flow: "auth"
    });
  });

  it("tracks LOGIN_CIE_CARD_READING_SUCCESS confirm", () => {
    const mockProps = { mock: true };
    (buildEventProperties as jest.Mock).mockReturnValue(mockProps);
    trackLoginCieCardReadingSuccess();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIE_CARD_READING_SUCCESS",
      mockProps
    );
    expect(buildEventProperties).toHaveBeenCalledWith("UX", "confirm", {
      flow: "auth"
    });
  });

  it("tracks LOGIN_CIE_CONSENT_DATA_USAGE screen view", () => {
    const mockProps = { mock: true };
    (buildEventProperties as jest.Mock).mockReturnValue(mockProps);
    trackLoginCieConsentDataUsageScreen();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIE_CONSENT_DATA_USAGE",
      mockProps
    );
    expect(buildEventProperties).toHaveBeenCalledWith("UX", "screen_view", {
      flow: "auth"
    });
  });

  it("tracks LOGIN_CIE_CARD_READING_ERROR with KO category", () => {
    const mockProps = { mock: true };
    (buildEventProperties as jest.Mock).mockReturnValue(mockProps);
    trackLoginCieCardReadingError();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIE_CARD_READING_ERROR",
      mockProps
    );
    expect(buildEventProperties).toHaveBeenCalledWith("KO", undefined, {
      flow: "auth"
    });
  });

  it("tracks LOGIN_CIE_DATA_SHARING_ERROR with KO category", () => {
    const mockProps = { mock: true };
    (buildEventProperties as jest.Mock).mockReturnValue(mockProps);
    trackLoginCieDataSharingError();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CIE_DATA_SHARING_ERROR",
      mockProps
    );
    expect(buildEventProperties).toHaveBeenCalledWith("KO", undefined, {
      flow: "auth"
    });
  });
});
