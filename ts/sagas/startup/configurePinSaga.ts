/**
 * A saga that handles setting/resetting the PIN.
 *
 * For a detailed view of the flow check
 * @https://docs.google.com/document/d/1le-IdjcGWtmfrMzh6d_qTwsnhVNCExbCd6Pt4gX7VGo/edit
 */

import { Either, left, right } from "fp-ts/lib/Either";
import { call, Effect, put, take } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";

import { navigateToOnboardingPinScreenAction } from "../../store/actions/navigation";
import {
  createPin,
  createPinFailure,
  createPinSuccess
} from "../../store/actions/pinset";

import { setPin } from "../../utils/keychain";

import { PinString } from "../../types/PinString";
import { SagaCallReturnType } from "../../types/utils";

export function* configurePinSaga(): Iterator<
  Effect | Either<Error, PinString>
> {
  // Navigate to the PinScreen
  yield put(navigateToOnboardingPinScreenAction);

  // Here we wait the user to complete the UI flow
  const action: ActionType<typeof createPin> = yield take(getType(createPin));

  try {
    const result: SagaCallReturnType<typeof setPin> = yield call(
      setPin,
      action.payload
    );
    if (!result) {
      throw Error("Cannot store PIN");
    }
    // We created a PIN, trigger a success
    yield put(createPinSuccess());
    return right(action.payload);
  } catch (error) {
    // We couldn't set a new PIN, trigger a failure
    yield put(createPinFailure());
    return left(error);
  }
}
