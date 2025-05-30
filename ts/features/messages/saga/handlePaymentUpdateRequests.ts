import * as E from "fp-ts/lib/Either";
import { Channel } from "redux-saga";
import {
  actionChannel,
  all,
  call,
  flush,
  fork,
  put,
  race,
  select,
  take
} from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { BackendClient } from "../../../api/backend";
import {
  cancelQueuedPaymentUpdates,
  updatePaymentForMessage
} from "../store/actions";
import {
  isMessagePaymentInfoV2Selector,
  isPagoPATestEnabledSelector
} from "../../../store/reducers/persistedPreferences";
import { withRefreshApiCall } from "../../authentication/fastLogin/saga/utils";
import { SagaCallReturnType } from "../../../types/utils";
import { readablePrivacyReport } from "../../../utils/reporters";
import { getWalletError } from "../../../utils/errors";
import { PaymentInfoResponse } from "../../../../definitions/backend/PaymentInfoResponse";

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
    // Listen for 'updatePaymentForMessage.request' action in the channel
    const paymentStatusRequest = yield* take(paymentStatusChannel);

    const { messageId, paymentId, serviceId } = paymentStatusRequest.payload;

    const isPagoPATestEnabled = yield* select(isPagoPATestEnabledSelector);
    const shouldUsePaymentInfoV2 = yield* select(
      isMessagePaymentInfoV2Selector
    );

    try {
      const { wasCancelled } = yield* race({
        hasVerifiedPayment: call(
          shouldUsePaymentInfoV2 ? updatePaymentInfo : legacyGetVerificaRpt,
          paymentStatusRequest,
          isPagoPATestEnabled,
          getVerificaRpt
        ),
        wasCancelled: take(cancelQueuedPaymentUpdates)
      });
      if (wasCancelled != null) {
        // TODO send actiont to update reducer data (from remoteLoading to remoteUndefined)
      }
    } catch (e) {
      // TODO better handling of timeout
      // string "max-retries"
      // object {"message":"Aborted","name":"AbortError"}
      // TODO better handling of generic errors that are not Details_V2Enum
      const details = getWalletError(e);
      const failureAction = updatePaymentForMessage.failure({
        messageId,
        paymentId,
        details,
        serviceId
      });
      yield* put(failureAction);
    }
  }
}

function* updatePaymentInfo(
  paymentStatusRequest: ActionType<typeof updatePaymentForMessage.request>,
  isPagoPATestEnabled: boolean,
  getPaymentDataRequestFactory: ReturnType<
    typeof BackendClient
  >["getPaymentInfoV2"]
) {
  const { messageId, paymentId, serviceId } = paymentStatusRequest.payload;

  const getPaymentDataRequest = getPaymentDataRequestFactory({
    rptId: paymentId,
    test: isPagoPATestEnabled
  });
  const responseEither = (yield* call(
    withRefreshApiCall,
    getPaymentDataRequest,
    paymentStatusRequest
  )) as SagaCallReturnType<typeof getPaymentDataRequestFactory>;

  if (E.isLeft(responseEither)) {
    throw Error(readablePrivacyReport(responseEither.left));
  }

  const response = responseEither.right;
  switch (response.status) {
    case 200:
      const paymentData = response.value;
      const successAction = updatePaymentForMessage.success({
        messageId,
        paymentId,
        paymentData,
        serviceId
      });
      yield* put(successAction);
      break;
    case 401:
      // This status code does not represent an error to show to the user
      // The authentication will be handled by the Fast Login token refresh procedure
      break;
    case 404:
    case 409:
    case 502:
    case 503:
      throw Error(response.value.faultCodeDetail);
    default:
      throw Error(
        `HTTP Status ${response.status} (${response.value.status}) (${response.value.title}) (${response.value.detail}) (${response.value.type}) (${response.value.instance})`
      );
  }
}

function* legacyGetVerificaRpt(
  paymentStatusRequest: ActionType<typeof updatePaymentForMessage.request>,
  isPagoPATestEnabled: boolean,
  getVerificaRpt: ReturnType<typeof BackendClient>["getVerificaRpt"]
) {
  const { messageId, paymentId, serviceId } = paymentStatusRequest.payload;

  const rptVerificationRequest = getVerificaRpt({
    rptId: paymentId,
    test: isPagoPATestEnabled
  });
  const responseEither = (yield* call(
    withRefreshApiCall,
    rptVerificationRequest,
    paymentStatusRequest
  )) as SagaCallReturnType<typeof getVerificaRpt>;

  if (E.isLeft(responseEither)) {
    throw Error(readablePrivacyReport(responseEither.left));
  }

  const response = responseEither.right;
  switch (response.status) {
    case 200:
      const legacyPaymentData = response.value;
      const paymentDataEither = PaymentInfoResponse.decode({
        amount: legacyPaymentData.importoSingoloVersamento,
        rptId: legacyPaymentData.codiceContestoPagamento,
        paFiscalCode:
          legacyPaymentData.enteBeneficiario?.identificativoUnivocoBeneficiario,
        paName: legacyPaymentData.enteBeneficiario?.denominazioneBeneficiario,
        description: legacyPaymentData.causaleVersamento,
        dueDate: legacyPaymentData.dueDate
      });
      if (E.isLeft(paymentDataEither)) {
        throw Error(
          `Conversion failed ${readablePrivacyReport(paymentDataEither.left)}`
        );
      }
      const paymentData = paymentDataEither.right;
      const successAction = updatePaymentForMessage.success({
        messageId,
        paymentId,
        paymentData,
        serviceId
      });
      yield* put(successAction);
      break;
    case 401:
      // This status code does not represent an error to show to the user
      // The authentication will be handled by the Fast Login token refresh procedure
      break;
    case 500:
    case 504:
      // Verifica failed with a 500 or 504, that usually means there was an error
      // interacting with pagoPA that we can interpret
      throw Error(response.value.detail_v2);
    default:
      throw Error(
        `HTTP Status ${response.status} (${response.value.status}) (${response.value.title}) (${response.value.detail}) (${response.value.type}) (${response.value.instance})`
      );
  }
}
