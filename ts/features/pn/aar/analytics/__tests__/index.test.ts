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
  trackSendAarNotificationClosureConfirm
} from "..";
import { AARProblemJson } from "../../../../../../definitions/pn/aar/AARProblemJson";
import * as mixpanel from "../../../../../mixpanel";
import { SendUserType } from "../../../../pushNotifications/analytics";

const sendUserTypes: ReadonlyArray<SendUserType> = [
  "mandatory",
  "not_set",
  "recipient"
];

describe("index", () => {
  const spiedOnMockedMixpanelTrack = jest
    .spyOn(mixpanel, "mixpanelTrack")
    .mockImplementation();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("trackSendQRCodeScanRedirect", () => {
    it("should call 'mixpanelTrack' with proper event name and properties", () => {
      trackSendQRCodeScanRedirect();

      expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
        "SEND_QRCODE_SCAN_REDIRECT"
      );
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
        event_category: "UX",
        event_type: "screen_view"
      });
    });
  });

  describe("trackSendQRCodeScanRedirectConfirmed", () => {
    it("should call 'mixpanelTrack' with proper event name and properties", () => {
      trackSendQRCodeScanRedirectConfirmed();

      expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
        "SEND_QRCODE_SCAN_REDIRECT_CONFIRMED"
      );
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
        event_category: "UX",
        event_type: "action"
      });
    });
  });

  describe("trackSendQRCodeScanRedirectDismissed", () => {
    it("should call 'mixpanelTrack' with proper event name and properties", () => {
      trackSendQRCodeScanRedirectDismissed();

      expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
        "SEND_QRCODE_SCAN_REDIRECT_DISMISSED"
      );
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
        event_category: "UX",
        event_type: "action"
      });
    });
  });

  describe("trackSendAARAttachmentDownloadFailure", () => {
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

  describe("trackSendAARToS", () => {
    it("should call 'mixpanelTrack' with proper event name and properties", () => {
      trackSendAARToS();

      expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
        "SEND_TEMPORARY_NOTIFICATION_OPENING_DISCLAIMER"
      );
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
        event_category: "UX",
        event_type: "screen_view"
      });
    });
  });

  describe("trackSendAARToSAccepted", () => {
    it("should call 'mixpanelTrack' with proper event name and properties", () => {
      trackSendAARToSAccepted();

      expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
        "SEND_TEMPORARY_NOTIFICATION_OPENING_DISCLAIMER_ACCEPTED"
      );
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
        event_category: "UX",
        event_type: "action"
      });
    });
  });

  describe("trackSendAARToSDismissed", () => {
    it("should call 'mixpanelTrack' with proper event name and properties", () => {
      trackSendAARToSDismissed();

      expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
        "SEND_TEMPORARY_NOTIFICATION_OPENING_DISCLAIMER_DISMISSED"
      );
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
        event_category: "UX",
        event_type: "action"
      });
    });
  });

  describe("trackSendAARAccessDeniedScreenView", () => {
    it("should call 'mixpanelTrack' with proper event name and properties", () => {
      trackSendAARAccessDeniedScreenView();

      expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
        "SEND_TEMPORARY_NOTIFICATION_OPENING_NOT_ALLOWED"
      );
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
        event_category: "UX",
        event_type: "screen_view"
      });
    });
  });

  describe("trackSendAARAccessDeniedDelegateInfo", () => {
    it("should call 'mixpanelTrack' with proper event name and properties", () => {
      trackSendAARAccessDeniedDelegateInfo();

      expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
        "SEND_TEMPORARY_NOTIFICATION_OPENING_NOT_ALLOWED_MANDATE_INFO"
      );
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
        event_category: "UX",
        event_type: "exit"
      });
    });
  });

  describe("trackSendAARAccessDeniedDismissed", () => {
    it("should call 'mixpanelTrack' with proper event name and properties", () => {
      trackSendAARAccessDeniedDismissed();

      expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
        "SEND_TEMPORARY_NOTIFICATION_OPENING_NOT_ALLOWED_DISMISSED"
      );
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
        event_category: "UX",
        event_type: "action"
      });
    });
  });

  describe("trackSendAarNotificationClosure", () => {
    sendUserTypes.forEach(userType => {
      it(`should call 'mixpanelTrack' with proper event name and parameters (userType ${userType})`, () => {
        trackSendAarNotificationClosure(userType);

        expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
        expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
        expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
          "SEND_TEMPORARY_NOTIFICATION_CLOSURE"
        );
        expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
          event_category: "UX",
          event_type: "screen_view",
          send_user: userType
        });
      });
    });
  });

  describe("trackSendAarNotificationClosureBack", () => {
    sendUserTypes.forEach(userType => {
      it(`should call 'mixpanelTrack' with proper event name and parameters (userType ${userType})`, () => {
        trackSendAarNotificationClosureBack(userType);

        expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
        expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
        expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
          "SEND_TEMPORARY_NOTIFICATION_CLOSURE_BACK"
        );
        expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
          event_category: "UX",
          event_type: "action",
          send_user: userType
        });
      });
    });
  });

  describe("trackSendAarNotificationClosureConfirm", () => {
    sendUserTypes.forEach(userType => {
      it(`should call 'mixpanelTrack' with proper event name and parameters (userType ${userType})`, () => {
        trackSendAarNotificationClosureConfirm(userType);

        expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
        expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
        expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
          "SEND_TEMPORARY_NOTIFICATION_CLOSURE_CONFIRM"
        );
        expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
          event_category: "UX",
          event_type: "action",
          send_user: userType
        });
      });
    });
  });
});
