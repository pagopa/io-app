import {
  trackCTAFrontMatterDecodingError,
  trackMessageNotificationParsingFailure,
  trackMessageNotificationTap,
  trackMessagePaymentFailure,
  trackOpenMessage
} from "..";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import * as MIXPANEL from "../../../../mixpanel";

describe("index", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  // eslint-disable-next-line sonarjs/cognitive-complexity
  describe("trackOpenMessage", () => {
    [false, true].forEach(firstTimeOpening =>
      [undefined, false, true].forEach(containsPayment =>
        [false, true].forEach(hasRemoteContent =>
          [false, true].forEach(containsAttachments =>
            [false, true].forEach(fromPushNotifications =>
              [false, true].forEach(hasFIMSCTA =>
                it(`should have proper values for firstTimeOpening (${firstTimeOpening}) containsPayment (${containsPayment}) hasRemoteContent (${hasRemoteContent}) containsAttachments (${containsAttachments}) fromPushNotifications (${fromPushNotifications}) hasFIMSCTA (${hasFIMSCTA}) and date_sent`, () => {
                  const spyOnMixpanelTrack = jest
                    .spyOn(MIXPANEL, "mixpanelTrack")
                    .mockReturnValue(undefined);
                  const serviceId = "01JK8TKP8QCNJ689M4D94VA6VG" as ServiceId;
                  const serviceName = "Service name";
                  const organizationName = "Organization name";
                  const organizationFiscalCode = "12345678901";
                  const createdAt = new Date(2025, 0, 1, 10, 30, 45);
                  void trackOpenMessage(
                    serviceId,
                    serviceName,
                    organizationName,
                    organizationFiscalCode,
                    firstTimeOpening,
                    containsPayment,
                    hasRemoteContent,
                    containsAttachments,
                    fromPushNotifications,
                    hasFIMSCTA,
                    createdAt
                  );
                  expect(spyOnMixpanelTrack.mock.calls.length).toBe(1);
                  expect(spyOnMixpanelTrack.mock.calls[0].length).toBe(2);
                  expect(spyOnMixpanelTrack.mock.calls[0][0]).toBe(
                    "OPEN_MESSAGE"
                  );
                  expect(spyOnMixpanelTrack.mock.calls[0][1]).toEqual({
                    event_category: "UX",
                    event_type: "screen_view",
                    flow: undefined,
                    service_id: serviceId,
                    service_name: serviceName,
                    organization_name: organizationName,
                    organization_fiscal_code: organizationFiscalCode,
                    contains_payment:
                      containsPayment != null
                        ? containsPayment
                          ? "yes"
                          : "no"
                        : "unknown",
                    remote_content: hasRemoteContent ? "yes" : "no",
                    contains_attachment: containsAttachments ? "yes" : "no",
                    first_time_opening: firstTimeOpening ? "yes" : "no",
                    fromPushNotification: fromPushNotifications ? "yes" : "no",
                    has_fims_callback: hasFIMSCTA ? "yes" : "no",
                    date_sent: "2025-01-01T10:30:45.000Z"
                  });
                })
              )
            )
          )
        )
      )
    );
  });

  describe("trackCTAFrontMatterDecodingError", () => {
    it("should call 'mixpanelTrack' with proper parameters", () => {
      const reason = "A reason";
      const serviceId = "01JK8TKP8QCNJ689M4D94VA6VG" as ServiceId;
      const spyOnMixpanelTrack = jest
        .spyOn(MIXPANEL, "mixpanelTrack")
        .mockImplementation((_event, _properties) => undefined);

      trackCTAFrontMatterDecodingError(reason, serviceId);

      expect(spyOnMixpanelTrack.mock.calls.length).toBe(1);
      expect(spyOnMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(spyOnMixpanelTrack.mock.calls[0][0]).toBe(
        "CTA_FRONT_MATTER_DECODING_ERROR"
      );
      expect(spyOnMixpanelTrack.mock.calls[0][1]).toEqual({
        event_category: "KO",
        event_type: undefined,
        flow: undefined,
        reason,
        serviceId
      });
    });
  });

  describe("trackMessageNotificationParsingFailure", () => {
    [false, true].forEach(optIn =>
      it(`should call 'mixpanelTrack' with proper parameters if mixpanel is initialized and the user ${
        optIn ? "has" : "has not"
      } opted-in`, () => {
        jest
          .spyOn(MIXPANEL, "isMixpanelInstanceInitialized")
          .mockReturnValue(true);
        const spiedOnMixpanelTrack = jest
          .spyOn(MIXPANEL, "mixpanelTrack")
          .mockImplementation();
        const spiedOnEnqueueMixpanelEvent = jest
          .spyOn(MIXPANEL, "enqueueMixpanelEvent")
          .mockImplementation();

        trackMessageNotificationParsingFailure("An id", "A reason", optIn);

        expect(spiedOnMixpanelTrack.mock.calls.length).toBe(1);
        expect(spiedOnMixpanelTrack.mock.calls[0].length).toBe(2);
        expect(spiedOnMixpanelTrack.mock.calls[0][0]).toBe(
          "NOTIFICATION_PARSING_FAILURE"
        );
        expect(spiedOnMixpanelTrack.mock.calls[0][1]).toEqual({
          event_category: "KO",
          reason: "A reason"
        });
        expect(spiedOnEnqueueMixpanelEvent.mock.calls.length).toBe(0);
      })
    );
    it(`should call 'enqueueMixpanelEvent' with proper parameters if mixpanel is not initialized and the user has opted-in`, () => {
      jest
        .spyOn(MIXPANEL, "isMixpanelInstanceInitialized")
        .mockReturnValue(false);
      const spiedOnMixpanelTrack = jest
        .spyOn(MIXPANEL, "mixpanelTrack")
        .mockImplementation();
      const spiedOnEnqueueMixpanelEvent = jest
        .spyOn(MIXPANEL, "enqueueMixpanelEvent")
        .mockImplementation();

      trackMessageNotificationParsingFailure("An id", "A reason", true);

      expect(spiedOnMixpanelTrack.mock.calls.length).toBe(0);
      expect(spiedOnEnqueueMixpanelEvent.mock.calls.length).toBe(1);
      expect(spiedOnEnqueueMixpanelEvent.mock.calls[0].length).toBe(3);
      expect(spiedOnEnqueueMixpanelEvent.mock.calls[0][0]).toBe(
        "NOTIFICATION_PARSING_FAILURE"
      );
      expect(spiedOnEnqueueMixpanelEvent.mock.calls[0][1]).toBe("An id");
      expect(spiedOnEnqueueMixpanelEvent.mock.calls[0][2]).toEqual({
        event_category: "KO",
        reason: "A reason"
      });
    });
    it(`should do nothing if mixpanel is not initialized and the user has not opted-in`, () => {
      jest
        .spyOn(MIXPANEL, "isMixpanelInstanceInitialized")
        .mockReturnValue(false);
      const spiedOnMixpanelTrack = jest
        .spyOn(MIXPANEL, "mixpanelTrack")
        .mockImplementation();
      const spiedOnEnqueueMixpanelEvent = jest
        .spyOn(MIXPANEL, "enqueueMixpanelEvent")
        .mockImplementation();

      trackMessageNotificationParsingFailure("An id", "A reason", false);

      expect(spiedOnMixpanelTrack.mock.calls.length).toBe(0);
      expect(spiedOnEnqueueMixpanelEvent.mock.calls.length).toBe(0);
    });
  });

  describe("trackMessageNotificationTap", () => {
    const messageId = "01JQVCP04AGJGVZ0D4D8XVK1H0";
    [false, true].forEach(optIn =>
      it(`should call 'mixpanelTrack' with proper parameters if mixpanel is initialized and the user ${
        optIn ? "has" : "has not"
      } opted-in`, () => {
        jest
          .spyOn(MIXPANEL, "isMixpanelInstanceInitialized")
          .mockReturnValue(true);
        const spiedOnMixpanelTrack = jest
          .spyOn(MIXPANEL, "mixpanelTrack")
          .mockImplementation();
        const spiedOnEnqueueMixpanelEvent = jest
          .spyOn(MIXPANEL, "enqueueMixpanelEvent")
          .mockImplementation();

        trackMessageNotificationTap(messageId, optIn);

        expect(spiedOnMixpanelTrack.mock.calls.length).toBe(1);
        expect(spiedOnMixpanelTrack.mock.calls[0].length).toBe(2);
        expect(spiedOnMixpanelTrack.mock.calls[0][0]).toBe(
          "NOTIFICATIONS_MESSAGE_TAP"
        );
        expect(spiedOnMixpanelTrack.mock.calls[0][1]).toEqual({
          event_category: "UX",
          event_type: "action",
          messageId
        });
        expect(spiedOnEnqueueMixpanelEvent.mock.calls.length).toBe(0);
      })
    );
    it(`should call 'enqueueMixpanelEvent' with proper parameters if mixpanel is not initialized and the user has opted-in`, () => {
      jest
        .spyOn(MIXPANEL, "isMixpanelInstanceInitialized")
        .mockReturnValue(false);
      const spiedOnMixpanelTrack = jest
        .spyOn(MIXPANEL, "mixpanelTrack")
        .mockImplementation();
      const spiedOnEnqueueMixpanelEvent = jest
        .spyOn(MIXPANEL, "enqueueMixpanelEvent")
        .mockImplementation();

      trackMessageNotificationTap(messageId, true);

      expect(spiedOnMixpanelTrack.mock.calls.length).toBe(0);
      expect(spiedOnEnqueueMixpanelEvent.mock.calls.length).toBe(1);
      expect(spiedOnEnqueueMixpanelEvent.mock.calls[0].length).toBe(3);
      expect(spiedOnEnqueueMixpanelEvent.mock.calls[0][0]).toBe(
        "NOTIFICATIONS_MESSAGE_TAP"
      );
      expect(spiedOnEnqueueMixpanelEvent.mock.calls[0][1]).toBe(messageId);
      expect(spiedOnEnqueueMixpanelEvent.mock.calls[0][2]).toEqual({
        event_category: "UX",
        event_type: "action",
        messageId
      });
    });
    it(`should do nothing if mixpanel is not initialized and the user has not opted-in`, () => {
      jest
        .spyOn(MIXPANEL, "isMixpanelInstanceInitialized")
        .mockReturnValue(false);
      const spiedOnMixpanelTrack = jest
        .spyOn(MIXPANEL, "mixpanelTrack")
        .mockImplementation();
      const spiedOnEnqueueMixpanelEvent = jest
        .spyOn(MIXPANEL, "enqueueMixpanelEvent")
        .mockImplementation();

      trackMessageNotificationTap(messageId, false);

      expect(spiedOnMixpanelTrack.mock.calls.length).toBe(0);
      expect(spiedOnEnqueueMixpanelEvent.mock.calls.length).toBe(0);
    });
  });

  describe("trackMessagePaymentFailure", () => {
    it("should call 'mixpanelTrack' with proper parameters", () => {
      const reason = "A reason";
      const spyOnMixpanelTrack = jest
        .spyOn(MIXPANEL, "mixpanelTrack")
        .mockImplementation((_event, _properties) => undefined);

      trackMessagePaymentFailure(reason);

      expect(spyOnMixpanelTrack.mock.calls.length).toBe(1);
      expect(spyOnMixpanelTrack.mock.calls[0].length).toBe(2);
      expect(spyOnMixpanelTrack.mock.calls[0][0]).toBe(
        "MESSAGE_PAYMENT_FAILURE"
      );
      expect(spyOnMixpanelTrack.mock.calls[0][1]).toEqual({
        event_category: "KO",
        event_type: undefined,
        flow: undefined,
        reason
      });
    });
  });
});
