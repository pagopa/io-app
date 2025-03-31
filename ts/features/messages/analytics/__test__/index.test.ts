import { trackCTAFrontMatterDecodingError, trackOpenMessage } from "..";
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
});
