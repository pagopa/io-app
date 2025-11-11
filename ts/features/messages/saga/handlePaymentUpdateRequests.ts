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
  isGenericError,
  PaymentError,
  toGenericError,
  toSpecificError,
  toTimeoutError,
  updatePaymentForMessage
} from "../store/actions";
import { isPagoPATestEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { withRefreshApiCall } from "../../authentication/fastLogin/saga/utils";
import { SagaCallReturnType } from "../../../types/utils";
import { readablePrivacyReport } from "../../../utils/reporters";
import { Detail_v2Enum } from "../../../../definitions/backend/PaymentProblemJson";
import { isTestEnv } from "../../../utils/environment";
import {
  trackMessagePaymentFailure,
  trackUndefinedBearerToken,
  UndefinedBearerTokenPhase
} from "../analytics";
import { sessionTokenSelector } from "../../authentication/common/store/selectors";
import { apiUrlPrefix } from "../../../config";
import { backendClientManager } from "../../../api/BackendClientManager";

const PaymentUpdateWorkerCount = 5;

export function* handlePaymentUpdateRequests() {
  const sessionToken = yield* select(sessionTokenSelector);

  if (!sessionToken) {
    trackUndefinedBearerToken(UndefinedBearerTokenPhase.getPaymentsInfo);
    return;
  }

  const { getPaymentInfoV2: getPaymentDataRequestFactory } =
    backendClientManager.getBackendClient(apiUrlPrefix, sessionToken);

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
        getPaymentDataRequestFactory
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
  getPaymentDataRequestFactory: BackendClient["getPaymentInfoV2"]
) {
  while (true) {
    // Listen for 'updatePaymentForMessage.request' action in the channel
    const paymentStatusRequest = yield* take(paymentStatusChannel);

    const { messageId, paymentId, serviceId } = paymentStatusRequest.payload;

    const isPagoPATestEnabled = yield* select(isPagoPATestEnabledSelector);

    try {
      yield* race({
        hasVerifiedPayment: call(
          updatePaymentInfo,
          paymentStatusRequest,
          isPagoPATestEnabled,
          getPaymentDataRequestFactory
        ),
        wasCancelled: take(cancelQueuedPaymentUpdates)
      });
    } catch (e) {
      const reason = yield* call(unknownErrorToPaymentError, e);
      yield* call(trackPaymentErrorIfNeeded, reason);
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

const trackPaymentErrorIfNeeded = (error: PaymentError) => {
  if (isGenericError(error)) {
    trackMessagePaymentFailure(error.message);
  }
};

export const testable = isTestEnv
  ? {
      paymentUpdateRequestWorker,
      trackPaymentErrorIfNeeded,
      unknownErrorToPaymentError,
      unknownErrorToString,
      updatePaymentInfo
    }
  : undefined;
