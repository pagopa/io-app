import { Effect } from "redux-saga/effects";
import { testSaga } from "redux-saga-test-plan";
import { call, take } from "typed-redux-saga/macro";
import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
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
  handlePaymentStatusForAnalyticsTracking,
  paymentStatusFromPaymentUpdateResult,
  testable
} from "../handlePaymentStatusForAnalyticsTracking";

import { serviceDetailsByIdSelector } from "../../../services/details/store/selectors";
import { trackPaymentStatus } from "../../analytics";

const messageId = "01JWX68NS39VA6YVWX0R10E3VM";
const paymentId = "01234567890123456789012345678901234567890";
const serviceId = "01JWX69WSREBXHRENH0GRP0N9M" as ServiceId;

describe("handlePaymentStatusForAnalyticsTracking", () => {
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
