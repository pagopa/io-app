import * as E from "fp-ts/lib/Either";
import { Channel, buffers, channel } from "redux-saga";
import { call, flush, fork, put, take } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import { RptIdFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { BackendClient } from "../../../api/backend";
import { commonPaymentVerificationProcedure } from "../../../sagas/wallet/pagopaApis";
import { Detail_v2Enum } from "../../../../definitions/backend/PaymentProblemJson";
import {
  cancelQueuedPaymentUpdates,
  updatePaymentForMessage
} from "../store/actions";

const generatePaymentUpdateWorkerCount = () => 5;

export function* watchPaymentUpdateRequests(
  getVerificaRpt: ReturnType<typeof BackendClient>["getVerificaRpt"]
) {
  // create a channel to queue incoming requests
  const paymentUpdateChannel = yield* call(() =>
    channel<ActionType<typeof updatePaymentForMessage.request>>(
      buffers.expanding()
    )
  );

  // create n worker 'threads'
  const paymentUpdateWorkerCount = generatePaymentUpdateWorkerCount();
  // eslint-disable-next-line functional/no-let
  for (let i = 0; i < paymentUpdateWorkerCount; i++) {
    yield* fork(
      handlePaymentUpdateRequests,
      paymentUpdateChannel,
      getVerificaRpt
    );
  }

  while (true) {
    const dequeuedChannelAction = yield* take([
      updatePaymentForMessage.request,
      cancelQueuedPaymentUpdates
    ]);

    if (isActionOf(updatePaymentForMessage.request, dequeuedChannelAction)) {
      yield* put(paymentUpdateChannel, dequeuedChannelAction);
    } else {
      const unproccessedQueuedUpdateRequests = yield* flush(
        paymentUpdateChannel
      );
      const payloads = unproccessedQueuedUpdateRequests.map(
        updateRequest => updateRequest.payload
      );
      if (payloads.length > 0) {
        yield* put(updatePaymentForMessage.cancel(payloads));
      }
    }
  }
}

function* handlePaymentUpdateRequests(
  paymentStatusChannel: Channel<
    ActionType<typeof updatePaymentForMessage.request>
  >,
  getVerificaRpt: ReturnType<typeof BackendClient>["getVerificaRpt"]
) {
  while (true) {
    const paymentStatusRequest = yield* take(paymentStatusChannel);
    const messageId = paymentStatusRequest.payload.messageId;
    const paymentId = paymentStatusRequest.payload.paymentId;
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
            paymentData
          }),
        details =>
          updatePaymentForMessage.failure({
            messageId,
            paymentId,
            details
          })
      );
    } else {
      yield* put(
        updatePaymentForMessage.failure({
          messageId,
          paymentId,
          details: Detail_v2Enum.GENERIC_ERROR
        })
      );
    }
  }
}
