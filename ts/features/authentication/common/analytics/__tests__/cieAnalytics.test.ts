import * as mixpanelModule from "../../../../../mixpanel";
import {
  trackLoginCiePinScreen,
  trackLoginCiePinInfo,
  trackLoginCieCardReaderScreen,
  trackLoginCieCardReadingSuccess,
  trackLoginCieConsentDataUsageScreen,
  trackLoginCieCardReadingError,
  trackLoginCieDataSharingError
} from "../cieAnalytics";

describe("cieAnalytics", () => {
  const mixpanelTrackSpy = jest
    .spyOn(mixpanelModule, "mixpanelTrack")
    .mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe.each([
    { flow: "auth" as const, label: "auth" },
    { flow: "reauth" as const, label: "reauth" },
    { flow: "FCI_auth" as const, label: "FCI_auth" }
  ])("with flow=$label", ({ flow }) => {
    it("trackLoginCiePinScreen sends correct event", () => {
      trackLoginCiePinScreen(flow);
      expect(mixpanelTrackSpy).toHaveBeenCalledWith(
        "LOGIN_CIE_PIN",
        expect.objectContaining({ flow })
      );
    });

    it("trackLoginCiePinInfo sends correct event", () => {
      trackLoginCiePinInfo(flow);
      expect(mixpanelTrackSpy).toHaveBeenCalledWith(
        "LOGIN_CIE_PIN_INFO",
        expect.objectContaining({ flow })
      );
    });

    it("trackLoginCieCardReaderScreen sends correct event", () => {
      trackLoginCieCardReaderScreen(flow);
      expect(mixpanelTrackSpy).toHaveBeenCalledWith(
        "LOGIN_CIE_CARD_READER",
        expect.objectContaining({ flow })
      );
    });

    it("trackLoginCieCardReadingSuccess sends correct event", () => {
      trackLoginCieCardReadingSuccess(flow);
      expect(mixpanelTrackSpy).toHaveBeenCalledWith(
        "LOGIN_CIE_CARD_READING_SUCCESS",
        expect.objectContaining({ flow })
      );
    });

    it("trackLoginCieConsentDataUsageScreen sends correct event", () => {
      trackLoginCieConsentDataUsageScreen(flow);
      expect(mixpanelTrackSpy).toHaveBeenCalledWith(
        "LOGIN_CIE_CONSENT_DATA_USAGE",
        expect.objectContaining({ flow })
      );
    });

    it("trackLoginCieCardReadingError sends correct event", () => {
      trackLoginCieCardReadingError(flow);
      expect(mixpanelTrackSpy).toHaveBeenCalledWith(
        "LOGIN_CIE_CARD_READING_ERROR",
        expect.objectContaining({ flow })
      );
    });

    it("trackLoginCieDataSharingError sends correct event", () => {
      trackLoginCieDataSharingError(flow);
      expect(mixpanelTrackSpy).toHaveBeenCalledWith(
        "LOGIN_CIE_DATA_SHARING_ERROR",
        expect.objectContaining({ flow })
      );
    });
  });
});
