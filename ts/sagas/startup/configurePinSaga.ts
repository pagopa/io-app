/**
 * A saga that handles setting/resetting the PIN.
 *
 * For a detailed view of the flow check
 * @https://docs.google.com/document/d/1le-IdjcGWtmfrMzh6d_qTwsnhVNCExbCd6Pt4gX7VGo/edit
 */

import { call, Effect, put, take } from "redux-saga/effects";

import {
  PIN_CREATE_FAILURE,
  PIN_CREATE_REQUEST,
  PIN_CREATE_SUCCESS
} from "../../store/actions/constants";

import { navigateToOnboardingPinScreenAction } from "../../store/actions/navigation";
import { PinCreateRequest } from "../../store/actions/pinset";

import { setPin } from "../../utils/keychain";

import { SagaCallReturnType } from "../../types/utils";

export function* configurePinSaga(): Iterator<Effect | boolean> {
  // Navigate to the PinScreen
  yield put(navigateToOnboardingPinScreenAction);

  // Here we wait the user to complete the UI flow
  const action: PinCreateRequest = yield take(PIN_CREATE_REQUEST);

  try {
    const result: SagaCallReturnType<typeof setPin> = yield call(
      setPin,
      action.payload
    );
    if (!result) {
      throw Error("Cannot store PIN");
    }
    // We created a PIN, trigger a success
    yield put({ type: PIN_CREATE_SUCCESS });
    return true;
  } catch (error) {
    // We couldn't set a new PIN, trigger a failure
    yield put({ type: PIN_CREATE_FAILURE });
    return false;
  }
}
