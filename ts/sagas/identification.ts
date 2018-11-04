import { Effect } from "redux-saga";
import { call, put, select, take, takeLatest } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";

import { startApplicationInitialization } from "../store/actions/application";
import { sessionInvalid } from "../store/actions/authentication";
import {
  identificationCancel,
  identificationPinReset,
  identificationRequest,
  identificationReset,
  identificationStart,
  identificationSuccess
} from "../store/actions/identification";
import { navigateToMessageDetailScreenAction } from "../store/actions/navigation";
import { clearNotificationPendingMessage } from "../store/actions/notifications";
import {
  IdentificationCancelData,
  IdentificationGenericData,
  IdentificationResult,
  IdentificationSuccessData
} from "../store/reducers/identification";
import { pendingMessageStateSelector } from "../store/reducers/notifications/pendingMessage";
import { GlobalState } from "../store/reducers/types";
import { isPaymentOngoingSelector } from "../store/reducers/wallet/payment";
import { PinString } from "../types/PinString";
import { SagaCallReturnType } from "../types/utils";
import { deletePin } from "../utils/keychain";

// Wait the identification and return the result
export function* waitIdentificationResult(): Iterator<
  Effect | IdentificationResult
> {
  const resultAction:
    | ActionType<typeof identificationCancel>
    | ActionType<typeof identificationPinReset>
    | ActionType<typeof identificationSuccess> = yield take([
    getType(identificationCancel),
    getType(identificationPinReset),
    getType(identificationSuccess)
  ]);

  switch (resultAction.type) {
    case getType(identificationCancel):
      return IdentificationResult.cancel;

    case getType(identificationPinReset): {
      // Invalidate the session
      yield put(sessionInvalid());

      // Delete the PIN
      // tslint:disable-next-line:saga-yield-return-type
      yield call(deletePin);

      // Hide the identification screen
      yield put(identificationReset());

      return IdentificationResult.pinreset;
    }

    case getType(identificationSuccess): {
      return IdentificationResult.success;
    }

    default: {
      ((): never => resultAction)();
    }
  }
}

/**
 * If you need to start the identification process and wait the result in a "sync" way,
 * like we do in the startup saga, use this generator
 */
export function* startAndReturnIdentificationResult(
  pin: PinString,
  identificationGenericData?: IdentificationGenericData,
  identificationCancelData?: IdentificationCancelData,
  identificationSuccessData?: IdentificationSuccessData
): Iterator<Effect | SagaCallReturnType<typeof waitIdentificationResult>> {
  yield put(
    identificationStart(
      pin,
      identificationGenericData,
      identificationCancelData,
      identificationSuccessData
    )
  );

  return yield call(waitIdentificationResult);
}

// Started by redux action
export function* startAndHandleIdentificationResult(
  pin: PinString,
  identificationRequestAction: ActionType<typeof identificationRequest>
): IterableIterator<Effect> {
  yield put(
    identificationStart(
      pin,
      identificationRequestAction.payload.identificationGenericData,
      identificationRequestAction.payload.identificationCancelData,
      identificationRequestAction.payload.identificationSuccessData
    )
  );
  const identificationResult = yield call(waitIdentificationResult);

  if (identificationResult === IdentificationResult.pinreset) {
    yield put(startApplicationInitialization());
  } else if (identificationResult === IdentificationResult.success) {
    // Check if we have a pending notification message
    const pendingMessageState: ReturnType<
      typeof pendingMessageStateSelector
    > = yield select<GlobalState>(pendingMessageStateSelector);

    // Check if there is a payment ongoing
    const isPaymentOngoing: ReturnType<
      typeof isPaymentOngoingSelector
    > = yield select<GlobalState>(isPaymentOngoingSelector);

    if (!isPaymentOngoing && pendingMessageState) {
      // We have a pending notification message to handle
      const messageId = pendingMessageState.id;

      // Remove the pending message from the notification state
      yield put(clearNotificationPendingMessage());

      // Navigate to message details screen
      yield put(navigateToMessageDetailScreenAction({ messageId }));
    }
  }
}

export function* watchIdentificationRequest(
  pin: PinString
): IterableIterator<Effect> {
  yield takeLatest(
    getType(identificationRequest),
    startAndHandleIdentificationResult,
    pin
  );
}
