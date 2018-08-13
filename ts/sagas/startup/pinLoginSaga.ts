import { Effect } from "redux-saga";
import { put, take } from "redux-saga/effects";

import { PIN_LOGIN_VALIDATE_REQUEST } from "../../store/actions/constants";
import { navigateToPinLogin } from "../../store/actions/navigation";
import {
  pinLoginValidateFailure,
  PinLoginValidateRequest,
  pinLoginValidateSuccess
} from "../../store/actions/pinlogin";

import { PinString } from "../../types/PinString";

/**
 * Makes the user login through the PIN
 */
export function* loginWithPinSaga(correctPin: PinString): Iterator<Effect> {
  // Navigate to the PIN_LOGIN screen
  yield put(navigateToPinLogin);

  while (true) {
    // Loop until the PIN validation succeeds

    const action: PinLoginValidateRequest = yield take(
      PIN_LOGIN_VALIDATE_REQUEST
    );
    const providedPin = action.payload;

    if (correctPin === providedPin) {
      // PIN is valid, stop here
      yield put(pinLoginValidateSuccess());
      return;
    }

    // ...or else, keep asking the PIN!
    yield put(pinLoginValidateFailure());
  }
}
