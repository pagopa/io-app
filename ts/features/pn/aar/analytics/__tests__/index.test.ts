import {
  aarProblemJsonAnalyticsReport,
  trackSendAARFailure,
  trackSendQRCodeScanRedirect,
  trackSendQRCodeScanRedirectConfirmed,
  trackSendQRCodeScanRedirectDismissed
} from "..";
import { AARProblemJson } from "../../../../../../definitions/pn/aar/AARProblemJson";
import * as mixpanel from "../../../../../mixpanel";

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
});
