import { Effect } from "redux-saga/effects";
import { testSaga } from "redux-saga-test-plan";
import { call, take } from "typed-redux-saga/macro";
import { Detail_v2Enum } from "../../../../../definitions/payments/PaymentProblemJson";
import {
  cancelPaymentStatusTracking,
  startPaymentStatusTracking,
  toGenericError,
  toSpecificError,
  toTimeoutError,
  updatePaymentForMessage,
  UpdatePaymentForMessageSuccess
} from "../../store/actions";
import {
  foldPaymentStatus,
  handlePaymentStatusForAnalyticsTracking,
  payablePayment,
  paymentStatusFromPaymentUpdateResult,
  processedPayment,
  testable
} from "../handlePaymentStatusForAnalyticsTracking";
import { UIMessageId } from "../../types";
import { ServiceId } from "../../../../../definitions/auth/ServiceId";
import { serviceDetailsByIdSelector } from "../../../services/details/store/reducers";
import { trackPaymentStatus } from "../../analytics";

const messageId = "01JWX68NS39VA6YVWX0R10E3VM" as UIMessageId;
const paymentId = "01234567890123456789012345678901234567890";
const serviceId = "01JWX69WSREBXHRENH0GRP0N9M" as ServiceId;

describe("handlePaymentStatusForAnalyticsTracking", () => {
  describe("payablePayment", () => {
    it("should match expected value", () => {
      expect(payablePayment).toEqual({
        kind: "Payable"
      });
    });
  });

  describe("processedPayment", () => {
    it("should match expected value", () => {
      const output = processedPayment(Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO);
      expect(output).toEqual({
        kind: "Processed",
        details: Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO
      });
    });
  });

  describe("foldPaymentStatus", () => {
    it("should invoke the first callback with proper parameters", () => {
      const payableCallback = jest.fn().mockReturnValue(3);
      const processedCallback = jest.fn().mockReturnValue(4);

      foldPaymentStatus(payableCallback, processedCallback)(payablePayment);

      expect(payableCallback.mock.calls.length).toBe(1);
      expect(payableCallback.mock.calls[0].length).toBe(0);
      expect(payableCallback.mock.results.length).toBe(1);
      expect(payableCallback.mock.results[0].value).toBe(3);

      expect(processedCallback.mock.results.length).toBe(0);
      expect(processedCallback.mock.calls.length).toBe(0);
    });
    it("should invoke the second callback with proper parameters", () => {
      const payableCallback = jest.fn().mockReturnValue(3);
      const processedCallback = jest.fn().mockReturnValue(4);

      foldPaymentStatus(
        payableCallback,
        processedCallback
      )(processedPayment(Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO));

      expect(payableCallback.mock.calls.length).toBe(0);
      expect(payableCallback.mock.results.length).toBe(0);

      expect(processedCallback.mock.calls.length).toBe(1);
      expect(processedCallback.mock.calls[0].length).toBe(1);
      expect(processedCallback.mock.calls[0][0]).toBe(
        Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO
      );
      expect(processedCallback.mock.results.length).toBe(1);
      expect(processedCallback.mock.results[0].value).toBe(4);
    });
  });

  describe("handlePaymentStatusForAnalyticsTracking", () => {
    it("should race 'trackPaymentUdpates' and 'cancelPaymentStatusTracking'", () => {
      testSaga(
        handlePaymentStatusForAnalyticsTracking,
        startPaymentStatusTracking()
      )
        .next()
        .race({
          polling: call(testable!.trackPaymentUpdates),
          cancelAction: take(cancelPaymentStatusTracking)
        } as unknown as { [key: string]: Effect })
        .next({ cancelAction: cancelPaymentStatusTracking() })
        .isDone();
    });
  });

  describe("trackPaymentUpdates", () => {
    it("should follow the expected flow", () => {
      const service = {
        name: "Test Service",
        organization: {
          name: "Test Organization",
          fiscal_code: "12345678901"
        }
      };
      testSaga(testable!.trackPaymentUpdates)
        .next()
        .take([
          updatePaymentForMessage.success,
          updatePaymentForMessage.failure
        ])
        .next(
          updatePaymentForMessage.failure({
            messageId,
            paymentId,
            reason: toTimeoutError(),
            serviceId
          })
        )
        .select(serviceDetailsByIdSelector, serviceId)
        .next(service)
        .call(
          trackPaymentStatus,
          serviceId,
          service.name,
          service.organization.name,
          service.organization.fiscal_code,
          "error"
        )
        .next()
        .take([
          updatePaymentForMessage.success,
          updatePaymentForMessage.failure
        ]);
    });
  });

  describe("paymentStatusFromPaymentUpdateResult", () => {
    it("should return 'unpaid' for 'updatePaymentForMessage.success' action", () => {
      const output = paymentStatusFromPaymentUpdateResult(
        updatePaymentForMessage.success({} as UpdatePaymentForMessageSuccess)
      );
      expect(output).toBe("unpaid");
    });
    it("should return 'error' for 'updatePaymentForMessage.failure' action with generic error", () => {
      const output = paymentStatusFromPaymentUpdateResult(
        updatePaymentForMessage.failure({
          messageId,
          paymentId,
          reason: toGenericError("Generic"),
          serviceId
        })
      );
      expect(output).toBe("error");
    });
    it("should return 'error' for 'updatePaymentForMessage.failure' action with tiemout error", () => {
      const output = paymentStatusFromPaymentUpdateResult(
        updatePaymentForMessage.failure({
          messageId,
          paymentId,
          reason: toTimeoutError(),
          serviceId
        })
      );
      expect(output).toBe("error");
    });
    it("should return 'expired' for 'updatePaymentForMessage.failure' action with specific error PAA_PAGAMENTO_SCADUTO", () => {
      const output = paymentStatusFromPaymentUpdateResult(
        updatePaymentForMessage.failure({
          messageId,
          paymentId,
          reason: toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_SCADUTO),
          serviceId
        })
      );
      expect(output).toBe("expired");
    });
    it("should return 'revoked' for 'updatePaymentForMessage.failure' action with specific error PAA_PAGAMENTO_ANNULLATO", () => {
      const output = paymentStatusFromPaymentUpdateResult(
        updatePaymentForMessage.failure({
          messageId,
          paymentId,
          reason: toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO),
          serviceId
        })
      );
      expect(output).toBe("revoked");
    });
    it("should return 'paid' for 'updatePaymentForMessage.failure' action with specific error PAA_PAGAMENTO_DUPLICATO", () => {
      const output = paymentStatusFromPaymentUpdateResult(
        updatePaymentForMessage.failure({
          messageId,
          paymentId,
          reason: toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO),
          serviceId
        })
      );
      expect(output).toBe("paid");
    });
    it("should return 'paid' for 'updatePaymentForMessage.failure' action with specific error PPT_PAGAMENTO_DUPLICATO", () => {
      const output = paymentStatusFromPaymentUpdateResult(
        updatePaymentForMessage.failure({
          messageId,
          paymentId,
          reason: toSpecificError(Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO),
          serviceId
        })
      );
      expect(output).toBe("paid");
    });
    it("should return 'inprogress' for 'updatePaymentForMessage.failure' action with specific error PAA_PAGAMENTO_IN_CORSO", () => {
      const output = paymentStatusFromPaymentUpdateResult(
        updatePaymentForMessage.failure({
          messageId,
          paymentId,
          reason: toSpecificError(Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO),
          serviceId
        })
      );
      expect(output).toBe("inprogress");
    });
    it("should return 'inprogress' for 'updatePaymentForMessage.failure' action with specific error PPT_PAGAMENTO_IN_CORSO", () => {
      const output = paymentStatusFromPaymentUpdateResult(
        updatePaymentForMessage.failure({
          messageId,
          paymentId,
          reason: toSpecificError(Detail_v2Enum.PPT_PAGAMENTO_IN_CORSO),
          serviceId
        })
      );
      expect(output).toBe("inprogress");
    });
    it("should return 'error' for 'updatePaymentForMessage.failure' action with specific error GENERIC_ERROR", () => {
      const output = paymentStatusFromPaymentUpdateResult(
        updatePaymentForMessage.failure({
          messageId,
          paymentId,
          reason: toSpecificError(Detail_v2Enum.GENERIC_ERROR),
          serviceId
        })
      );
      expect(output).toBe("error");
    });
  });
});
