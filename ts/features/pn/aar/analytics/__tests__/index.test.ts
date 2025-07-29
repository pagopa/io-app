import {
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
    it("should cal 'mixpanelTrack' with proper event name and properties", () => {
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
    it("should cal 'mixpanelTrack' with proper event name and properties", () => {
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
    it("should cal 'mixpanelTrack' with proper event name and properties", () => {
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
    it("should cal 'mixpanelTrack' with proper event name and properties", () => {
      trackSendActivationModalDialog();

      expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
        "SEND_ACTIVATION_MODAL_DIALOG"
      );
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
        event_category: "UX",
        event_type: "screen_view"
      });
    });
  });

  describe("trackSendActivationModalDialogActivationStart", () => {
    it("should cal 'mixpanelTrack' with proper event name and properties", () => {
      trackSendActivationModalDialogActivationStart();

      expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
        "SEND_ACTIVATION_MODAL_DIALOG_ACTIVATION_START"
      );
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
        event_category: "UX",
        event_type: "action"
      });
    });
  });

  describe("trackSendActivationModalDialogActivationDismissed", () => {
    it("should cal 'mixpanelTrack' with proper event name and properties", () => {
      trackSendActivationModalDialogActivationDismissed();

      expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
        "SEND_ACTIVATION_MODAL_DIALOG_DISMISSED"
      );
      expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
        event_category: "UX",
        event_type: "action"
      });
    });
  });
});
