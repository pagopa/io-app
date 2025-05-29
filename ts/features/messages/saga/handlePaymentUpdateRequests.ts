import * as E from "fp-ts/lib/Either";
import { Channel } from "redux-saga";
import {
  actionChannel,
  all,
  call,
  flush,
  fork,
  put,
  take
} from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { RptIdFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { BackendClient } from "../../../api/backend";
import { Detail_v2Enum } from "../../../../definitions/backend/PaymentProblemJson";
import {
  cancelQueuedPaymentUpdates,
  updatePaymentForMessage
} from "../store/actions";
import { commonPaymentVerificationProcedure } from "../../../sagas/legacyWallet/pagopaApis";

const PaymentUpdateWorkerCount = 5;

export function* handlePaymentUpdateRequests(
  getVerificaRpt: ReturnType<typeof BackendClient>["getVerificaRpt"]
) {
  // Create a channel where 'updatePaymentForMessage.request' actions will be enqueued
  const paymentUpdateChannel = yield* actionChannel(
    updatePaymentForMessage.request
  );

  // Create workers to process 'updatePaymentForMessage.request' actions 'concurrently'
  yield* all(
    [...Array(PaymentUpdateWorkerCount).keys()].map(() =>
      fork(paymentUpdateRequestWorker, paymentUpdateChannel, getVerificaRpt)
    )
  );

  while (true) {
    // Listen for cancellation request
    yield* take(cancelQueuedPaymentUpdates);

    // Flush the channel
    const unproccessedQueuedUpdateRequests = yield* flush(paymentUpdateChannel);

    // If there were actions enqueued, put their payloads into an array and
    // dispatch an 'updatePaymentForMessage.cancel' to restore payments' state
    const payloads = unproccessedQueuedUpdateRequests.map(
      updateRequest => updateRequest.payload
    );
    if (payloads.length > 0) {
      yield* put(updatePaymentForMessage.cancel(payloads));
    }
  }
}

function* paymentUpdateRequestWorker(
  paymentStatusChannel: Channel<
    ActionType<typeof updatePaymentForMessage.request>
  >,
  getVerificaRpt: ReturnType<typeof BackendClient>["getVerificaRpt"]
) {
  while (true) {
    const paymentStatusRequest = yield* take(paymentStatusChannel);

    const { messageId, paymentId, serviceId } = paymentStatusRequest.payload;

    const pagoPARptIdEither = RptIdFromString.decode(paymentId);
    if (E.isRight(pagoPARptIdEither)) {
      const pagoPARptId = pagoPARptIdEither.right;
      yield* call(
        commonPaymentVerificationProcedure,
        getVerificaRpt,
        pagoPARptId,
        paymentData =>
          updatePaymentForMessage.success({
            messageId,
            paymentId,
            paymentData,
            serviceId
          }),
        details =>
          updatePaymentForMessage.failure({
            messageId,
            paymentId,
            details,
            serviceId
          })
      );
    } else {
      yield* put(
        updatePaymentForMessage.failure({
          messageId,
          paymentId,
          details: Detail_v2Enum.GENERIC_ERROR,
          serviceId
        })
      );
    }
  }
}
