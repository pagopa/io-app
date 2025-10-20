import {
  booleanOrUndefinedToPNServiceStatus,
  trackPNNotificationLoadSuccess,
  trackPNUxSuccess
} from "..";
import * as MIXPANEL from "../../../../mixpanel";

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
            (["aar", "message", "not_set"] as const).forEach(openingSource =>
              (["recipient", "mandatory", "not_set"] as const).forEach(
                userType => {
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

                    expect(spiedOnMockedMixpanelTrack.mock.calls.length).toBe(
                      1
                    );
                    expect(
                      spiedOnMockedMixpanelTrack.mock.calls[0].length
                    ).toBe(2);
                    expect(spiedOnMockedMixpanelTrack.mock.calls[0][0]).toBe(
                      "PN_UX_SUCCESS"
                    );
                    expect(spiedOnMockedMixpanelTrack.mock.calls[0][1]).toEqual(
                      {
                        event_category: "UX",
                        event_type: "screen_view",
                        contains_payment: paymentCount > 0 ? "yes" : "no",
                        first_time_opening:
                          firstTimeOpening === true
                            ? "yes"
                            : firstTimeOpening === false
                            ? "no"
                            : "not_set",
                        notification_status: isCancelled
                          ? "cancelled"
                          : "active",
                        contains_multipayment: paymentCount > 1 ? "yes" : "no",
                        count_payment: paymentCount,
                        contains_f24: containsF24,
                        opening_source: openingSource,
                        send_user: userType
                      }
                    );
                  });
                }
              )
            )
          )
        )
      )
    );
  });

  describe("trackPNNotificationLoadSuccess", () => {
    [false, true].forEach(hasAttachments =>
      [undefined, "CANCELLED"].forEach(status =>
        (["aar", "message", "not_set"] as const).forEach(openingSource =>
          (["recipient", "mandatory", "not_set"] as const).forEach(userType =>
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
});
