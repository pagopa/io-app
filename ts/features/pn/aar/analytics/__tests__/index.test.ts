import {
  trackSendAARAttachmentDownloadFailure,
  trackSendAARToS,
  trackSendAARToSAccepted,
  trackSendAARToSDismissed,
  trackSendActivationModalDialog,
  trackSendActivationModalDialogActivationDismissed,
  trackSendActivationModalDialogActivationStart,
  trackSendQRCodeScanRedirect,
  trackSendQRCodeScanRedirectConfirmed,
  trackSendQRCodeScanRedirectDismissed
} from "..";
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

  describe("trackSendActivationModalDialog", () => {
    (
      ["authentication", "send_notification_opening", "access"] as const
    ).forEach(flow =>
      (["aar", "message", "not_set"] as const).forEach(source =>
        (["recipient", "mandatory", "not_set"] as const).forEach(user =>
          it(`should call 'mixpanelTrack' with proper event name and properties (flow ${flow} source ${source} user ${user})`, () => {
            trackSendActivationModalDialog(flow, source, user);

            expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
            expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
            expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
              "SEND_ACTIVATION_MODAL_DIALOG"
            );
            expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
              event_category: "UX",
              event_type: "screen_view",
              flow,
              opening_source: source,
              send_user: user
            });
          })
        )
      )
    );
  });

  describe("trackSendActivationModalDialogActivationStart", () => {
    (
      ["authentication", "send_notification_opening", "access"] as const
    ).forEach(flow =>
      (["aar", "message", "not_set"] as const).forEach(source =>
        (["recipient", "mandatory", "not_set"] as const).forEach(user =>
          it(`should call 'mixpanelTrack' with proper event name and properties (flow ${flow} source ${source} user ${user})`, () => {
            trackSendActivationModalDialogActivationStart(flow, source, user);

            expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
            expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
            expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
              "SEND_ACTIVATION_MODAL_DIALOG_ACTIVATION_START"
            );
            expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
              event_category: "UX",
              event_type: "action",
              flow,
              opening_source: source,
              send_user: user
            });
          })
        )
      )
    );
  });

  describe("trackSendActivationModalDialogActivationDismissed", () =>
    (
      ["authentication", "send_notification_opening", "access"] as const
    ).forEach(flow =>
      (["aar", "message", "not_set"] as const).forEach(source =>
        (["recipient", "mandatory", "not_set"] as const).forEach(user =>
          it(`should call 'mixpanelTrack' with proper event name and properties (flow ${flow} source ${source}) use ${user}`, () => {
            trackSendActivationModalDialogActivationDismissed(
              flow,
              source,
              user
            );

            expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
            expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
            expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
              "SEND_ACTIVATION_MODAL_DIALOG_DISMISSED"
            );
            expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
              event_category: "UX",
              event_type: "action",
              flow,
              opening_source: source,
              send_user: user
            });
          })
        )
      )
    ));

  describe("trackSendAARAttachmentDownloadFailure", () => {
    it("should call 'mixpanelTrack' with proper event name and properties", () => {
      const reason = "The reason";
      trackSendAARAttachmentDownloadFailure(reason);

      expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
        "SEND_AAR_ATTACHMENT_DOWNLOAD_FAILED"
      );
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
        event_category: "KO",
        event_type: undefined,
        reason
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
});
