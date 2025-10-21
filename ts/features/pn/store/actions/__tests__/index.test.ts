import {
  cancelPNPaymentStatusTracking,
  dismissPnActivationReminderBanner,
  pnActivationUpsert,
  startPNPaymentStatusTracking
} from "../index";

describe("PN actions", () => {
  describe("pnActivationUpsert", () => {
    it("should create a request action with the provided payload", () => {
      const payload = {
        value: true,
        onSuccess: jest.fn(),
        onFailure: jest.fn()
      };

      const action = pnActivationUpsert.request(payload);

      expect(action).toEqual({
        type: "PN_ACTIVATION_UPSERT_REQUEST",
        payload
      });
    });

    it("should create a success action", () => {
      const action = pnActivationUpsert.success();

      expect(action).toEqual({
        type: "PN_ACTIVATION_UPSERT_SUCCESS"
      });
    });

    it("should create a failure action", () => {
      const action = pnActivationUpsert.failure();

      expect(action).toEqual({
        type: "PN_ACTIVATION_UPSERT_FAILURE"
      });
    });
  });

  describe("startPNPaymentStatusTracking", () => {
    [false, true].forEach(isAARNotification => {
      [false, true].forEach(isDelegate => {
        it(`should create a start tracking action with the provided messageId (isAARNotification: ${isAARNotification} isDelegate ${isDelegate})`, () => {
          const messageId = "message-123";

          const action = startPNPaymentStatusTracking({
            isAARNotification,
            messageId,
            isDelegate
          });

          expect(action).toEqual({
            type: "PN_START_TRACKING_PAYMENT_STATUS",
            payload: { isAARNotification, isDelegate, messageId }
          });
        });
      });
    });
  });

  describe("cancelPNPaymentStatusTracking", () => {
    it("should create a cancel tracking action", () => {
      const action = cancelPNPaymentStatusTracking();

      expect(action).toEqual({
        type: "PN_CANCEL_PAYMENT_STATUS_TRACKING"
      });
    });
  });

  describe("dismissPnActivationReminderBanner", () => {
    it("should create a dismiss banner action", () => {
      const action = dismissPnActivationReminderBanner();

      expect(action).toEqual({
        type: "DISMISS_PN_ACTIVATION_REMINDER_BANNER"
      });
    });
  });
});
