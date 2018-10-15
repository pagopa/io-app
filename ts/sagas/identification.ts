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
  IdentificationResult,
  IdentificationSuccessData
} from "../store/reducers/identification";
import {
  PendingMessageState,
  pendingMessageStateSelector
} from "../store/reducers/notifications/pendingMessage";
import { GlobalState } from "../store/reducers/types";
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

  // If the identification was cancelled just return false
  if (resultAction.type === getType(identificationCancel)) {
    return IdentificationResult.cancel;
  }

  // If the user decided to reset the pin perform needed actions than return false
  if (resultAction.type === getType(identificationPinReset)) {
    // Delete the PIN
    // tslint:disable-next-line:saga-yield-return-type
    yield call(deletePin);

    // Invalidate the session
    yield put(sessionInvalid());

    // Hide the identification screen
    yield put(identificationReset());

    return IdentificationResult.pinreset;
  }

  // Identification was success return true
  return IdentificationResult.success;
}

/**
 * If you need to start the identification process and wait the result in a "sync" way,
 * like we do in the startup saga, use this generator
 */
export function* startAndReturnIdentificationResult(
  pin: PinString,
  identificationCancelData?: IdentificationCancelData,
  identificationSuccessData?: IdentificationSuccessData
): Iterator<Effect | SagaCallReturnType<typeof waitIdentificationResult>> {
  yield put(
    identificationStart(
      pin,
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
      identificationRequestAction.payload.identificationCancelData,
      identificationRequestAction.payload.identificationSuccessData
    )
  );
  const identificationResult = yield call(waitIdentificationResult);

  if (identificationResult === IdentificationResult.pinreset) {
    yield put(startApplicationInitialization());
  } else if (identificationResult === IdentificationResult.success) {
    // Check if we have a pending notification message
    const pendingMessageState: PendingMessageState = yield select<GlobalState>(
      pendingMessageStateSelector
    );

    if (pendingMessageState) {
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
