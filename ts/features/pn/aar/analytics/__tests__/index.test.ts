import {
  trackSendAARAccessDeniedDelegateInfo,
  trackSendAARAccessDeniedDismissed,
  trackSendAARAccessDeniedScreenView,
  trackSendAARToS,
  trackSendAARToSAccepted,
  trackSendAARToSDismissed,
  aarProblemJsonAnalyticsReport,
  trackSendAARFailure,
  trackSendQRCodeScanRedirect,
  trackSendQRCodeScanRedirectConfirmed,
  trackSendQRCodeScanRedirectDismissed,
  trackSendAarNotificationClosure,
  trackSendAarNotificationClosureBack,
  trackSendAarNotificationClosureConfirm,
  trackSendAarNotificationClosureExit,
  trackSendAarErrorScreenClosure,
  trackSendAarErrorScreenDetails,
  trackSendAarErrorScreenDetailsHelp,
  trackSendAarErrorScreenDetailsCode,
  trackSendAarNotificationOpeningMandateDisclaimer,
  trackSendAarNotificationOpeningMandateDisclaimerAccepted,
  trackSendAarNotificationOpeningMandateDisclaimerClosure,
  trackSendAarNotificationOpeningMandateBottomSheet,
  trackSendAarNotificationOpeningMandateBottomSheetAccepted,
  trackSendAarNotificationOpeningMandateBottomSheetClosure,
  trackSendAarNotificationOpeningNfcNotSupported,
  trackSendAarNotificationOpeningNfcNotSupportedInfo,
  trackSendAarNotificationOpeningNfcNotSupportedClosure,
  trackSendAarMandateCiePreparation,
  trackSendAarMandateCiePreparationContinue,
  trackSendAarMandateCieReadingClosureAlert,
  trackSendAarMandateCieReadingClosureAlertAccepted,
  trackSendAarMandateCieReadingClosureAlertContinue,
  trackSendAarMandateCieCanEnter,
  trackSendAarMandateCieCardReadingDisclaimer,
  trackSendAarMandateCieCardReadingDisclaimerContinue,
  trackSendAarMandateCieCardReading,
  trackSendAarMandateCieCardReadingSuccess,
  trackSendAarMandateCieCardReadingError,
  type SendAarScreen
} from "..";
import { AARProblemJson } from "../../../../../../definitions/pn/aar/AARProblemJson";
import * as mixpanel from "../../../../../mixpanel";
import { buildEventProperties } from "../../../../../utils/analytics";
import { SendUserType } from "../../../../pushNotifications/analytics";

type TrackingTestBase<FN extends (...p: Array<any>) => void = () => void> = {
  name: string;
  fn: FN;
  eventName: string;
  eventProps: {
    event_category: Parameters<typeof buildEventProperties>[0];
    event_type: Parameters<typeof buildEventProperties>[1];
  };
};

type TrackingTestWithUserType = TrackingTestBase<
  (userType: SendUserType) => void
>;

const sendUserTypes: ReadonlyArray<SendUserType> = [
  "mandatory",
  "not_set",
  "recipient"
];

const sendAarScreens: ReadonlyArray<SendAarScreen> = [
  "CIE_PREPARATION",
  "NFC_ACTIVATION"
];

// Configuration for simple tracking tests
const simpleTrackingTests: ReadonlyArray<TrackingTestBase> = [
  {
    name: "trackSendQRCodeScanRedirect",
    fn: trackSendQRCodeScanRedirect,
    eventName: "SEND_QRCODE_SCAN_REDIRECT",
    eventProps: { event_category: "UX", event_type: "screen_view" }
  },
  {
    name: "trackSendQRCodeScanRedirectConfirmed",
    fn: trackSendQRCodeScanRedirectConfirmed,
    eventName: "SEND_QRCODE_SCAN_REDIRECT_CONFIRMED",
    eventProps: { event_category: "UX", event_type: "action" }
  },
  {
    name: "trackSendQRCodeScanRedirectDismissed",
    fn: trackSendQRCodeScanRedirectDismissed,
    eventName: "SEND_QRCODE_SCAN_REDIRECT_DISMISSED",
    eventProps: { event_category: "UX", event_type: "action" }
  },
  {
    name: "trackSendAARToS",
    fn: trackSendAARToS,
    eventName: "SEND_TEMPORARY_NOTIFICATION_OPENING_DISCLAIMER",
    eventProps: { event_category: "UX", event_type: "screen_view" }
  },
  {
    name: "trackSendAARToSAccepted",
    fn: trackSendAARToSAccepted,
    eventName: "SEND_TEMPORARY_NOTIFICATION_OPENING_DISCLAIMER_ACCEPTED",
    eventProps: { event_category: "UX", event_type: "action" }
  },
  {
    name: "trackSendAARToSDismissed",
    fn: trackSendAARToSDismissed,
    eventName: "SEND_TEMPORARY_NOTIFICATION_OPENING_DISCLAIMER_DISMISSED",
    eventProps: { event_category: "UX", event_type: "action" }
  },
  {
    name: "trackSendAARAccessDeniedScreenView",
    fn: trackSendAARAccessDeniedScreenView,
    eventName: "SEND_TEMPORARY_NOTIFICATION_OPENING_NOT_ALLOWED",
    eventProps: { event_category: "UX", event_type: "screen_view" }
  },
  {
    name: "trackSendAARAccessDeniedDelegateInfo",
    fn: trackSendAARAccessDeniedDelegateInfo,
    eventName: "SEND_TEMPORARY_NOTIFICATION_OPENING_NOT_ALLOWED_MANDATE_INFO",
    eventProps: { event_category: "UX", event_type: "exit" }
  },
  {
    name: "trackSendAARAccessDeniedDismissed",
    fn: trackSendAARAccessDeniedDismissed,
    eventName: "SEND_TEMPORARY_NOTIFICATION_OPENING_NOT_ALLOWED_DISMISSED",
    eventProps: { event_category: "UX", event_type: "action" }
  },
  {
    name: "trackSendAarErrorScreenClosure",
    fn: trackSendAarErrorScreenClosure,
    eventName: "SEND_AAR_ERROR_CLOSURE",
    eventProps: { event_category: "UX", event_type: "action" }
  },
  {
    name: "trackSendAarErrorScreenDetails",
    fn: trackSendAarErrorScreenDetails,
    eventName: "SEND_AAR_ERROR_DETAIL",
    eventProps: { event_category: "UX", event_type: "screen_view" }
  },
  {
    name: "trackSendAarErrorScreenDetailsHelp",
    fn: trackSendAarErrorScreenDetailsHelp,
    eventName: "SEND_AAR_ERROR_DETAIL_HELP",
    eventProps: { event_category: "UX", event_type: "action" }
  },
  {
    name: "trackSendAarErrorScreenDetailsCode",
    fn: trackSendAarErrorScreenDetailsCode,
    eventName: "SEND_AAR_ERROR_DETAIL_CODE",
    eventProps: { event_category: "UX", event_type: "action" }
  },
  {
    name: "trackSendAarNotificationOpeningMandateDisclaimer",
    fn: trackSendAarNotificationOpeningMandateDisclaimer,
    eventName: "SEND_NOTIFICATION_OPENING_MANDATE_DISCLAIMER",
    eventProps: { event_category: "UX", event_type: "screen_view" }
  },
  {
    name: "trackSendAarNotificationOpeningMandateDisclaimerAccepted",
    fn: trackSendAarNotificationOpeningMandateDisclaimerAccepted,
    eventName: "SEND_NOTIFICATION_OPENING_MANDATE_DISCLAIMER_ACCEPTED",
    eventProps: { event_category: "UX", event_type: "action" }
  },
  {
    name: "trackSendAarNotificationOpeningMandateDisclaimerClosure",
    fn: trackSendAarNotificationOpeningMandateDisclaimerClosure,
    eventName: "SEND_NOTIFICATION_OPENING_MANDATE_DISCLAIMER_CLOSURE",
    eventProps: { event_category: "UX", event_type: "exit" }
  },
  {
    name: "trackSendAarNotificationOpeningMandateBottomSheet",
    fn: trackSendAarNotificationOpeningMandateBottomSheet,
    eventName: "SEND_NOTIFICATION_OPENING_MANDATE_BOTTOMSHEET",
    eventProps: { event_category: "UX", event_type: "screen_view" }
  },
  {
    name: "trackSendAarNotificationOpeningMandateBottomSheetAccepted",
    fn: trackSendAarNotificationOpeningMandateBottomSheetAccepted,
    eventName: "SEND_NOTIFICATION_OPENING_MANDATE_BOTTOMSHEET_ACCEPTED",
    eventProps: { event_category: "UX", event_type: "action" }
  },
  {
    name: "trackSendAarNotificationOpeningMandateBottomSheetClosure",
    fn: trackSendAarNotificationOpeningMandateBottomSheetClosure,
    eventName: "SEND_NOTIFICATION_OPENING_MANDATE_BOTTOMSHEET_CLOSURE",
    eventProps: { event_category: "UX", event_type: "action" }
  },
  {
    name: "trackSendAarNotificationOpeningNfcNotSupported",
    fn: trackSendAarNotificationOpeningNfcNotSupported,
    eventName: "SEND_NOTIFICATION_OPENING_NFC_NOT_SUPPORTED",
    eventProps: { event_category: "UX", event_type: "screen_view" }
  },
  {
    name: "trackSendAarNotificationOpeningNfcNotSupportedInfo",
    fn: trackSendAarNotificationOpeningNfcNotSupportedInfo,
    eventName: "SEND_NOTIFICATION_OPENING_NFC_NOT_SUPPORTED_INFO",
    eventProps: { event_category: "UX", event_type: "action" }
  },
  {
    name: "trackSendAarNotificationOpeningNfcNotSupportedClosure",
    fn: trackSendAarNotificationOpeningNfcNotSupportedClosure,
    eventName: "SEND_NOTIFICATION_OPENING_NFC_NOT_SUPPORTED_CLOSURE",
    eventProps: { event_category: "UX", event_type: "exit" }
  },
  {
    name: "trackSendAarMandateCiePreparation",
    fn: trackSendAarMandateCiePreparation,
    eventName: "SEND_MANDATE_CIE_PREPARATION",
    eventProps: { event_category: "UX", event_type: "screen_view" }
  },
  {
    name: "trackSendAarMandateCiePreparationContinue",
    fn: trackSendAarMandateCiePreparationContinue,
    eventName: "SEND_MANDATE_CIE_PREPARATION_CONTINUE",
    eventProps: { event_category: "UX", event_type: "action" }
  },
  {
    name: "trackSendAarMandateCieCanEnter",
    fn: trackSendAarMandateCieCanEnter,
    eventName: "SEND_MANDATE_CIE_CAN_ENTER",
    eventProps: { event_category: "UX", event_type: "screen_view" }
  },
  {
    name: "trackSendAarMandateCieCardReadingDisclaimer",
    fn: trackSendAarMandateCieCardReadingDisclaimer,
    eventName: "SEND_MANDATE_CIE_CARD_READING_DISCLAIMER",
    eventProps: { event_category: "UX", event_type: "screen_view" }
  },
  {
    name: "trackSendAarMandateCieCardReadingDisclaimerContinue",
    fn: trackSendAarMandateCieCardReadingDisclaimerContinue,
    eventName: "SEND_MANDATE_CIE_CARD_READING_DISCLAIMER_CONTINUE",
    eventProps: { event_category: "UX", event_type: "action" }
  },
  {
    name: "trackSendAarMandateCieCardReading",
    fn: trackSendAarMandateCieCardReading,
    eventName: "SEND_MANDATE_CIE_CARD_READING",
    eventProps: { event_category: "UX", event_type: "screen_view" }
  },
  {
    name: "trackSendAarMandateCieCardReadingSuccess",
    fn: trackSendAarMandateCieCardReadingSuccess,
    eventName: "SEND_MANDATE_CIE_CARD_READING_SUCCESS",
    eventProps: { event_category: "UX", event_type: "screen_view" }
  },
  {
    name: "trackSendAarMandateCieCardReadingError",
    fn: trackSendAarMandateCieCardReadingError,
    eventName: "SEND_MANDATE_CIE_CARD_READING_ERROR",
    eventProps: { event_category: "KO", event_type: undefined }
  }
];

// Configuration for tracking tests with userType
const userTypeTrackingTests: ReadonlyArray<TrackingTestWithUserType> = [
  {
    name: "trackSendAarNotificationClosure",
    fn: trackSendAarNotificationClosure,
    eventName: "SEND_TEMPORARY_NOTIFICATION_CLOSURE",
    eventProps: { event_category: "UX", event_type: "screen_view" }
  },
  {
    name: "trackSendAarNotificationClosureBack",
    fn: trackSendAarNotificationClosureBack,
    eventName: "SEND_TEMPORARY_NOTIFICATION_CLOSURE_BACK",
    eventProps: { event_category: "UX", event_type: "action" }
  },
  {
    name: "trackSendAarNotificationClosureConfirm",
    fn: trackSendAarNotificationClosureConfirm,
    eventName: "SEND_TEMPORARY_NOTIFICATION_CLOSURE_CONFIRM",
    eventProps: { event_category: "UX", event_type: "action" }
  },
  {
    name: "trackSendAarNotificationClosureExit",
    fn: trackSendAarNotificationClosureExit,
    eventName: "SEND_TEMPORARY_NOTIFICATION_CLOSURE_EXIT",
    eventProps: { event_category: "UX", event_type: "exit" }
  }
];

describe("index", () => {
  const spiedOnMockedMixpanelTrack = jest
    .spyOn(mixpanel, "mixpanelTrack")
    .mockImplementation();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe.each(userTypeTrackingTests)(
    "$name",
    ({ fn, eventName, eventProps }) => {
      it.each(sendUserTypes)(
        "should call 'mixpanelTrack' with proper event name and parameters (userType %s)",
        userType => {
          fn(userType);

          expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
          expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
          expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(eventName);
          expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
            ...eventProps,
            send_user: userType
          });
        }
      );
    }
  );

  describe("trackSendAARFailure", () => {
    (
      [
        "Download Attachment",
        "Entry Point",
        "Fetch Notification",
        "Fetch QRCode",
        "Show Notification"
      ] as const
    ).forEach(phase =>
      it(`should call 'mixpanelTrack' with proper event name and properties (phase : ${phase})`, () => {
        const reason = "The reason";
        trackSendAARFailure(phase, reason);

        expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
        expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
        expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
          "SEND_AAR_ERROR"
        );
        expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
          event_category: "KO",
          event_type: undefined,
          phase,
          reason
        });
      })
    );
  });

  describe("aarProblemJsonAnalyticsReport", () => {
    const responseCode = 400;

    it("should report with only status and detail", () => {
      const input: AARProblemJson = {
        status: 599,
        detail: "Invalid request"
      };
      const expected = "400 599 Invalid request";
      expect(aarProblemJsonAnalyticsReport(responseCode, input)).toBe(expected);
    });

    it("should report with status, detail, and title", () => {
      const input: AARProblemJson = {
        status: 599,
        detail: "Invalid request",
        title: "Bad Request"
      };
      const expected = "400 599 Bad Request Invalid request";
      expect(aarProblemJsonAnalyticsReport(responseCode, input)).toBe(expected);
    });

    it("should report with status, detail, title, and traceId", () => {
      const input: AARProblemJson = {
        status: 599,
        detail: "Invalid request",
        title: "Bad Request",
        traceId: "trace-123"
      };
      const expected = "400 599 Bad Request Invalid request trace-123";
      expect(aarProblemJsonAnalyticsReport(responseCode, input)).toBe(expected);
    });

    it("should report with status, detail, title, traceId, and empty errors array", () => {
      const input: AARProblemJson = {
        status: 599,
        detail: "Invalid request",
        title: "Bad Request",
        traceId: "trace-123",
        errors: []
      };
      const expected = "400 599 Bad Request Invalid request trace-123";
      expect(aarProblemJsonAnalyticsReport(responseCode, input)).toBe(expected);
    });

    describe("with one error", () => {
      it("should report with an error containing only code", () => {
        const input: AARProblemJson = {
          status: 599,
          detail: "Invalid request",
          title: "Bad Request",
          traceId: "trace-123",
          errors: [{ code: "ERR-01" }]
        };
        const expected = "400 599 Bad Request Invalid request trace-123 ERR-01";
        expect(aarProblemJsonAnalyticsReport(responseCode, input)).toBe(
          expected
        );
      });

      it("should report with an error containing code and detail", () => {
        const input: AARProblemJson = {
          status: 599,
          detail: "Invalid request",
          title: "Bad Request",
          traceId: "trace-123",
          errors: [{ code: "ERR-01", detail: "Field is missing" }]
        };
        const expected =
          "400 599 Bad Request Invalid request trace-123 ERR-01 Field is missing";
        expect(aarProblemJsonAnalyticsReport(responseCode, input)).toBe(
          expected
        );
      });

      it("should report with an error containing code and element", () => {
        const input: AARProblemJson = {
          status: 599,
          detail: "Invalid request",
          title: "Bad Request",
          traceId: "trace-123",
          errors: [{ code: "ERR-01", element: "fieldName" }]
        };
        const expected =
          "400 599 Bad Request Invalid request trace-123 ERR-01 fieldName";
        expect(aarProblemJsonAnalyticsReport(responseCode, input)).toBe(
          expected
        );
      });

      it("should report with an error containing code, detail, and element", () => {
        const input: AARProblemJson = {
          status: 599,
          detail: "Invalid request",
          title: "Bad Request",
          traceId: "trace-123",
          errors: [
            {
              code: "ERR-01",
              detail: "Field is missing",
              element: "fieldName"
            }
          ]
        };
        const expected =
          "400 599 Bad Request Invalid request trace-123 ERR-01 Field is missing fieldName";
        expect(aarProblemJsonAnalyticsReport(responseCode, input)).toBe(
          expected
        );
      });
    });

    describe("with two errors", () => {
      it("should report with errors containing only code", () => {
        const input: AARProblemJson = {
          status: 599,
          detail: "Invalid request",
          title: "Bad Request",
          traceId: "trace-123",
          errors: [{ code: "ERR-01" }, { code: "ERR-02" }]
        };
        const expected =
          "400 599 Bad Request Invalid request trace-123 ERR-01, ERR-02";
        expect(aarProblemJsonAnalyticsReport(responseCode, input)).toBe(
          expected
        );
      });

      it("should report with errors containing code and detail", () => {
        const input: AARProblemJson = {
          status: 599,
          detail: "Invalid request",
          title: "Bad Request",
          traceId: "trace-123",
          errors: [
            { code: "ERR-01", detail: "Field is missing" },
            { code: "ERR-02", detail: "Another field is missing" }
          ]
        };
        const expected =
          "400 599 Bad Request Invalid request trace-123 ERR-01 Field is missing, ERR-02 Another field is missing";
        expect(aarProblemJsonAnalyticsReport(responseCode, input)).toBe(
          expected
        );
      });

      it("should report with errors containing code and (element + detail)", () => {
        const input: AARProblemJson = {
          status: 599,
          detail: "Invalid request",
          title: "Bad Request",
          traceId: "trace-123",
          errors: [
            { code: "ERR-01", element: "fieldName1" },
            { code: "ERR-02", detail: "Field is missing" }
          ]
        };
        const expected =
          "400 599 Bad Request Invalid request trace-123 ERR-01 fieldName1, ERR-02 Field is missing";
        expect(aarProblemJsonAnalyticsReport(responseCode, input)).toBe(
          expected
        );
      });

      it("should report with errors containing code and element", () => {
        const input: AARProblemJson = {
          status: 599,
          detail: "Invalid request",
          title: "Bad Request",
          traceId: "trace-123",
          errors: [
            { code: "ERR-01", element: "fieldName1" },
            { code: "ERR-02", element: "fieldName2" }
          ]
        };
        const expected =
          "400 599 Bad Request Invalid request trace-123 ERR-01 fieldName1, ERR-02 fieldName2";
        expect(aarProblemJsonAnalyticsReport(responseCode, input)).toBe(
          expected
        );
      });

      it("should report with errors containing code and (detail + element)", () => {
        const input: AARProblemJson = {
          status: 599,
          detail: "Invalid request",
          title: "Bad Request",
          traceId: "trace-123",
          errors: [
            { code: "ERR-01", detail: "Field is missing" },
            { code: "ERR-02", element: "fieldName2" }
          ]
        };
        const expected =
          "400 599 Bad Request Invalid request trace-123 ERR-01 Field is missing, ERR-02 fieldName2";
        expect(aarProblemJsonAnalyticsReport(responseCode, input)).toBe(
          expected
        );
      });

      it("should report with errors containing code, detail, and element", () => {
        const input: AARProblemJson = {
          status: 599,
          detail: "Invalid request",
          title: "Bad Request",
          traceId: "trace-123",
          errors: [
            {
              code: "ERR-01",
              detail: "Field is missing",
              element: "fieldName1"
            },
            {
              code: "ERR-02",
              detail: "Another field is missing",
              element: "fieldName2"
            }
          ]
        };
        const expected =
          "400 599 Bad Request Invalid request trace-123 ERR-01 Field is missing fieldName1, ERR-02 Another field is missing fieldName2";
        expect(aarProblemJsonAnalyticsReport(responseCode, input)).toBe(
          expected
        );
      });
    });
  });
  // Generate tests for simple tracking
  describe.each(simpleTrackingTests)(
    "$name",
    ({ fn, eventName, eventProps }) => {
      it("should call 'mixpanelTrack' with proper event name and properties", () => {
        fn();

        expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
        expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
        expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(eventName);
        expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual(eventProps);
      });
    }
  );
  describe("trackSendAarMandateCieReadingClosureAlert", () => {
    it.each(sendAarScreens)(
      "should call 'mixpanelTrack' with proper event name and properties (screen: \"%s\")",
      screen => {
        trackSendAarMandateCieReadingClosureAlert(screen);

        expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
        expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
        expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
          "SEND_MANDATE_CIE_READING_CLOSURE_ALERT"
        );
        expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
          event_category: "UX",
          event_type: "screen_view",
          screen
        });
      }
    );
  });
  describe("trackSendAarMandateCieReadingClosureAlertAccepted", () => {
    it.each(sendAarScreens)(
      "should call 'mixpanelTrack' with proper event name and properties (screen: \"%s\")",
      screen => {
        trackSendAarMandateCieReadingClosureAlertAccepted(screen);

        expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
        expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
        expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
          "SEND_MANDATE_CIE_READING_CLOSURE_ALERT_ACCEPTED"
        );
        expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
          event_category: "UX",
          event_type: "exit",
          screen
        });
      }
    );
  });
  describe("trackSendAarMandateCieReadingClosureAlertContinue", () => {
    it.each(sendAarScreens)(
      "should call 'mixpanelTrack' with proper event name and properties (screen: \"%s\")",
      screen => {
        trackSendAarMandateCieReadingClosureAlertContinue(screen);

        expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
        expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
        expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
          "SEND_MANDATE_CIE_READING_CLOSURE_ALERT_CONTINUE"
        );
        expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
          event_category: "UX",
          event_type: "action",
          screen
        });
      }
    );
  });
});
