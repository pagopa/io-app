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
  PaymentError,
  toGenericError,
  toReasonString,
  toSpecificError,
  toTimeoutError,
  updatePaymentForMessage
} from "../store/actions";
import {
  isMessagePaymentInfoV2Selector,
  isPagoPATestEnabledSelector
} from "../../../store/reducers/persistedPreferences";
import { withRefreshApiCall } from "../../authentication/fastLogin/saga/utils";
import { SagaCallReturnType } from "../../../types/utils";
import { readablePrivacyReport } from "../../../utils/reporters";
import { PaymentInfoResponse } from "../../../../definitions/backend/PaymentInfoResponse";
import { Detail_v2Enum } from "../../../../definitions/backend/PaymentProblemJson";
import { isTestEnv } from "../../../utils/environment";
import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

const PaymentUpdateWorkerCount = 5;

export function* handlePaymentUpdateRequests(
  getPaymentDataRequestFactory: BackendClient["getPaymentInfoV2"],
  getVerificaRptFactory: BackendClient["getVerificaRpt"]
) {
  // Create a channel where 'updatePaymentForMessage.request' actions will be enqueued
  const paymentUpdateChannel = yield* actionChannel(
    updatePaymentForMessage.request
  );

  // Create workers to process 'updatePaymentForMessage.request' actions 'concurrently'
  yield* all(
    [...Array(PaymentUpdateWorkerCount).keys()].map(() =>
      fork(
        paymentUpdateRequestWorker,
        paymentUpdateChannel,
        getPaymentDataRequestFactory,
        getVerificaRptFactory
      )
    )
  );

  while (true) {
    // Listen for cancellation request
    yield* take(cancelQueuedPaymentUpdates);

    // Flush the channel
    yield* flush(paymentUpdateChannel);
  }
}

function* paymentUpdateRequestWorker(
  paymentStatusChannel: Channel<
    ActionType<typeof updatePaymentForMessage.request>
  >,
  getPaymentDataRequestFactory: BackendClient["getPaymentInfoV2"],
  getVerificaRptFactory: BackendClient["getVerificaRpt"]
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
      yield* race({
        hasVerifiedPayment: shouldUsePaymentInfoV2
          ? call(
              updatePaymentInfo,
              paymentStatusRequest,
              isPagoPATestEnabled,
              getPaymentDataRequestFactory
            )
          : call(
              legacyGetVerificaRpt,
              paymentStatusRequest,
              isPagoPATestEnabled,
              getVerificaRptFactory
            ),
        wasCancelled: take(cancelQueuedPaymentUpdates)
      });
    } catch (e) {
      const reason = yield* call(unknownErrorToPaymentError, e);
      void mixpanelTrack(
        "MESSAGE_PAYMENT_FAILURE",
        buildEventProperties("TECH", undefined, {
          reason: toReasonString(reason)
        })
      );
      const failureAction = updatePaymentForMessage.failure({
        messageId,
        paymentId,
        reason,
        serviceId
      });
      yield* put(failureAction);
    }
  }
}

function* updatePaymentInfo(
  paymentStatusRequest: ActionType<typeof updatePaymentForMessage.request>,
  isPagoPATestEnabled: boolean,
  getPaymentDataRequestFactory: BackendClient["getPaymentInfoV2"]
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
  getVerificaRptFactory: BackendClient["getVerificaRpt"]
) {
  const { messageId, paymentId, serviceId } = paymentStatusRequest.payload;

  const rptVerificationRequest = getVerificaRptFactory({
    rptId: paymentId,
    test: isPagoPATestEnabled
  });
  const responseEither = (yield* call(
    withRefreshApiCall,
    rptVerificationRequest,
    paymentStatusRequest
  )) as SagaCallReturnType<typeof getVerificaRptFactory>;

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

const unknownErrorToPaymentError = (e: unknown): PaymentError => {
  const reason = unknownErrorToString(e);
  const lowerCaseReason = reason.toLowerCase();
  if (lowerCaseReason === "max-retries" || lowerCaseReason === "aborted") {
    return toTimeoutError();
  }
  if (reason in Detail_v2Enum) {
    return toSpecificError(reason as Detail_v2Enum);
  }
  return toGenericError(reason);
};

const unknownErrorToString = (e: unknown): string => {
  if (e != null) {
    if (typeof e === "string") {
      return e as string;
    }
    if (typeof e === "object" && "message" in e) {
      return `${e.message}`;
    }
    return "Error with unknown data";
  }

  return "Unknown error with no data";
};

export const testable = isTestEnv
  ? {
      legacyGetVerificaRpt,
      paymentUpdateRequestWorker,
      unknownErrorToPaymentError,
      unknownErrorToString,
      updatePaymentInfo
    }
  : undefined;
