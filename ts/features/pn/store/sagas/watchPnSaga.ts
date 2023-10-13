import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { Channel, SagaIterator, buffers, channel } from "redux-saga";
import {
  call,
  flush,
  fork,
  put,
  select,
  take,
  takeLatest
} from "typed-redux-saga/macro";
import { ActionType, getType, isActionOf } from "typesafe-actions";
import _ from "lodash";
import { RptIdFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { apiUrlPrefix } from "../../../../config";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { SessionToken } from "../../../../types/SessionToken";
import { getError } from "../../../../utils/errors";
import { BackendPnClient } from "../../api/backendPn";
import {
  updatePaymentForMessage,
  pnActivationUpsert,
  cancelQueuedPaymentUpdates
} from "../actions";
import {
  trackPNServiceStatusChangeError,
  trackPNServiceStatusChangeSuccess
} from "../../analytics";
import { servicePreferenceSelector } from "../../../../store/reducers/entities/services/servicePreference";
import { isServicePreferenceResponseSuccess } from "../../../../types/services/ServicePreferenceResponse";
import { BackendClient } from "../../../../api/backend";
import { commonPaymentVerificationProcedure } from "../../../../sagas/wallet/pagopaApis";
import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";

const generatePaymentUpdateWorkerCount = () => 5;

function* upsertPnActivation(
  client: ReturnType<typeof BackendPnClient>,
  action: ActionType<typeof pnActivationUpsert.request>
) {
  const activation_status = action.payload;
  try {
    const isTest: ReturnType<typeof isPnTestEnabledSelector> = yield* select(
      isPnTestEnabledSelector
    );

    const result = yield* call(client.upsertPnActivation, {
      body: {
        activation_status
      },
      isTest
    });

    if (E.isLeft(result)) {
      yield* put(
        pnActivationUpsert.failure(new Error(readableReport(result.left)))
      );
    } else if (result.right.status === 204) {
      trackPNServiceStatusChangeSuccess(activation_status);
      yield* put(pnActivationUpsert.success(activation_status));
    } else {
      yield* call(reportPNServiceStatusOnFailure, !activation_status);
      yield* put(
        pnActivationUpsert.failure(
          new Error(`response status ${result.right.status}`)
        )
      );
    }
  } catch (e) {
    yield* call(reportPNServiceStatusOnFailure, !activation_status);
    yield* put(pnActivationUpsert.failure(getError(e)));
  }
}

function* reportPNServiceStatusOnFailure(predictedValue: boolean) {
  const selectedServicePreferencePot = yield* select(servicePreferenceSelector);
  const isServiceActive = pipe(
    selectedServicePreferencePot,
    pot.toOption,
    O.map(
      servicePreferenceResponse =>
        isServicePreferenceResponseSuccess(servicePreferenceResponse) &&
        servicePreferenceResponse.value.inbox
    ),
    O.getOrElse(() => predictedValue)
  );
  trackPNServiceStatusChangeError(isServiceActive);
}

export function* watchPnSaga(
  bearerToken: SessionToken,
  getVerificaRpt: ReturnType<typeof BackendClient>["getVerificaRpt"]
): SagaIterator {
  const pnBackendClient = BackendPnClient(apiUrlPrefix, bearerToken);

  yield* takeLatest(
    getType(pnActivationUpsert.request),
    upsertPnActivation,
    pnBackendClient
  );

  yield* fork(watchPaymentUpdateRequests, getVerificaRpt);
}

function* watchPaymentUpdateRequests(
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
    const paymentUpdateRequest = yield* take([
      updatePaymentForMessage.request,
      cancelQueuedPaymentUpdates
    ]);

    if (isActionOf(updatePaymentForMessage.request)) {
      yield* put(paymentUpdateChannel, paymentUpdateRequest);
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
