import {
  booleanOrUndefinedToPNServiceStatus,
  trackPNAttachmentOpening,
  trackPNNotificationLoadSuccess,
  trackPNPaymentStart,
  trackPNPaymentStatus,
  trackPNShowF24,
  trackPNShowTimeline,
  trackPNTimelineExternal,
  trackPNUxSuccess
} from "..";
import * as MIXPANEL from "../../../../mixpanel";
import { PaymentStatistics } from "../../../messages/store/reducers/payments";
import {
  SendOpeningSource,
  SendUserType
} from "../../../pushNotifications/analytics";

const sendOpeningSources: ReadonlyArray<SendOpeningSource> = [
  "aar",
  "message",
  "not_set"
];
const sendUserTypes: ReadonlyArray<SendUserType> = [
  "mandatory",
  "not_set",
  "recipient"
];

describe("index", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("booleanOrUndefinedToPNServiceStatus", () => {
    (
      [
        [undefined, "unknown"],
        [false, "not_active"],
        [true, "active"]
      ] as const
    ).forEach(([input, expectedOutput]) => {
      it(`should return '${expectedOutput}' for '${input}'`, () => {
        const output = booleanOrUndefinedToPNServiceStatus(input);
        expect(output).toBe(expectedOutput);
      });
    });
  });

  // eslint-disable-next-line sonarjs/cognitive-complexity
  describe("trackPNUxSuccess", () => {
    [0, 1, 2].forEach(paymentCount =>
      [undefined, false, true].forEach(firstTimeOpening =>
        [false, true].forEach(isCancelled =>
          [false, true].forEach(containsF24 =>
            sendOpeningSources.forEach(openingSource =>
              sendUserTypes.forEach(userType => {
                it(`should call 'mixpanelTrack' with proper event name and parameters (paymentCount ${paymentCount} firstTimeOpening ${firstTimeOpening} isCancelled ${isCancelled} containsF24 ${containsF24} openingSource ${openingSource} userType ${userType})`, () => {
                  const spiedOnMockedMixpanelTrack = jest
                    .spyOn(MIXPANEL, "mixpanelTrack")
                    .mockImplementation();

                  trackPNUxSuccess(
                    paymentCount,
                    firstTimeOpening,
                    isCancelled,
                    containsF24,
                    openingSource,
                    userType
                  );

                  expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
                  expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(
                    2
                  );
                  expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
                    "PN_UX_SUCCESS"
                  );
                  expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
                    event_category: "UX",
                    event_type: "screen_view",
                    contains_payment: paymentCount > 0 ? "yes" : "no",
                    first_time_opening:
                      firstTimeOpening === true
                        ? "yes"
                        : firstTimeOpening === false
                        ? "no"
                        : "not_set",
                    notification_status: isCancelled ? "cancelled" : "active",
                    contains_multipayment: paymentCount > 1 ? "yes" : "no",
                    count_payment: paymentCount,
                    contains_f24: containsF24,
                    opening_source: openingSource,
                    send_user: userType
                  });
                });
              })
            )
          )
        )
      )
    );
  });

  describe("trackPNNotificationLoadSuccess", () => {
    [false, true].forEach(hasAttachments =>
      [undefined, "CANCELLED"].forEach(status =>
        sendOpeningSources.forEach(openingSource =>
          sendUserTypes.forEach(userType =>
            it(`should call 'mixpanelTrack' with proper event name and properties (hasAttachments ${hasAttachments} status ${status} openingSource ${openingSource} userType ${userType})`, () => {
              const spiedOnMockedMixpanelTrack = jest
                .spyOn(MIXPANEL, "mixpanelTrack")
                .mockImplementation();

              trackPNNotificationLoadSuccess(
                hasAttachments,
                status,
                openingSource,
                userType
              );

              expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
              expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
              expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
                "PN_NOTIFICATION_LOAD_SUCCESS"
              );
              expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
                event_category: "TECH",
                event_type: undefined,
                NOTIFICATION_LAST_STATUS: status ?? "not_set",
                HAS_ATTACHMENTS: hasAttachments,
                opening_source: openingSource,
                send_user: userType
              });
            })
          )
        )
      )
    );
  });

  describe("trackPNPaymentStatus", () => {
    sendOpeningSources.forEach(source => {
      sendUserTypes.forEach(userType => {
        it(`should call 'mixpanelTrack' with proper event name and parameters (source ${source} userType ${userType})`, () => {
          const spiedOnMockedMixpanelTrack = jest
            .spyOn(MIXPANEL, "mixpanelTrack")
            .mockImplementation();

          const paymentStatistics: PaymentStatistics = {
            errorCount: 1,
            expiredCount: 2,
            ongoingCount: 3,
            paidCount: 4,
            paymentCount: 5,
            revokedCount: 6,
            unpaidCount: 7
          };

          trackPNPaymentStatus(paymentStatistics, source, userType);

          expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
          expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
          expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
            "PN_PAYMENT_STATUS"
          );
          expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
            event_category: "TECH",
            event_type: undefined,
            count_payment: paymentStatistics.paymentCount,
            count_unpaid: paymentStatistics.unpaidCount,
            count_paid: paymentStatistics.paidCount,
            count_error: paymentStatistics.errorCount,
            count_expired: paymentStatistics.expiredCount,
            count_revoked: paymentStatistics.revokedCount,
            count_inprogress: paymentStatistics.ongoingCount,
            opening_source: source,
            send_user: userType
          });
        });
      });
    });
  });

  describe("trackPNAttachmentOpening", () => {
    sendOpeningSources.forEach(source => {
      sendUserTypes.forEach(userType => {
        [undefined, "F24"].forEach(category => {
          it(`should call 'mixpanelTrack' with proper event name and parameters (source ${source} userType ${userType} category ${category})`, () => {
            const spiedOnMockedMixpanelTrack = jest
              .spyOn(MIXPANEL, "mixpanelTrack")
              .mockImplementation();

            trackPNAttachmentOpening(source, userType, category);

            expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
            expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
            expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
              "PN_ATTACHMENT_OPENING"
            );
            expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
              event_category: "UX",
              event_type: "action",
              category,
              opening_source: source,
              send_user: userType
            });
          });
        });
      });
    });
  });

  describe("trackPNPaymentStart", () => {
    sendOpeningSources.forEach(source => {
      sendUserTypes.forEach(userType => {
        it(`should call 'mixpanelTrack' with proper event name and parameters (source ${source} userType ${userType})`, () => {
          const spiedOnMockedMixpanelTrack = jest
            .spyOn(MIXPANEL, "mixpanelTrack")
            .mockImplementation();

          trackPNPaymentStart(source, userType);

          expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
          expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
          expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
            "PN_PAYMENT_START"
          );
          expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
            event_category: "UX",
            event_type: "action",
            opening_source: source,
            send_user: userType
          });
        });
      });
    });
  });

  describe("trackPNShowTimeline", () => {
    sendOpeningSources.forEach(source => {
      sendUserTypes.forEach(userType => {
        it(`should call 'mixpanelTrack' with proper event name and parameters (source ${source} userType ${userType})`, () => {
          const spiedOnMockedMixpanelTrack = jest
            .spyOn(MIXPANEL, "mixpanelTrack")
            .mockImplementation();

          trackPNShowTimeline(source, userType);

          expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
          expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
          expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
            "PN_SHOW_TIMELINE"
          );
          expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
            event_category: "UX",
            event_type: "action",
            opening_source: source,
            send_user: userType
          });
        });
      });
    });
  });

  describe("trackPNShowF24", () => {
    sendOpeningSources.forEach(source => {
      sendUserTypes.forEach(userType => {
        it(`should call 'mixpanelTrack' with proper event name and parameters (source ${source} userType ${userType})`, () => {
          const spiedOnMockedMixpanelTrack = jest
            .spyOn(MIXPANEL, "mixpanelTrack")
            .mockImplementation();

          trackPNShowF24(source, userType);

          expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
          expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
          expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
            "PN_SHOW_F24"
          );
          expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
            event_category: "UX",
            event_type: "action",
            opening_source: source,
            send_user: userType
          });
        });
      });
    });
  });

  describe("trackPNTimelineExternal", () => {
    sendOpeningSources.forEach(source => {
      sendUserTypes.forEach(userType => {
        it(`should call 'mixpanelTrack' with proper event name and parameters (source ${source} userType ${userType})`, () => {
          const spiedOnMockedMixpanelTrack = jest
            .spyOn(MIXPANEL, "mixpanelTrack")
            .mockImplementation();

          trackPNTimelineExternal(source, userType);

          expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(1);
          expect(spiedOnMockedMixpanelTrack.mock.calls[0].length).toBe(2);
          expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
            "PN_TIMELINE_EXTERNAL"
          );
          expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual({
            event_category: "UX",
            event_type: "exit",
            opening_source: source,
            send_user: userType
          });
        });
      });
    });
  });
});
