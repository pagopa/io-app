import { Effect } from "redux-saga";
import { put, take } from "redux-saga/effects";

import { navigateToPinLogin } from "../../store/actions/navigation";
import {
  pinLoginValidateFailure,
  pinLoginValidateRequest,
  pinLoginValidateSuccess
} from "../../store/actions/pinlogin";

import { ActionType, getType } from "typesafe-actions";
import { PinString } from "../../types/PinString";

/**
 * Makes the user login through the PIN
 */
export function* loginWithPinSaga(correctPin: PinString): Iterator<Effect> {
  // Navigate to the PIN_LOGIN screen
  yield put(navigateToPinLogin);

  while (true) {
    // Loop until the PIN validation succeeds

    const action: ActionType<typeof pinLoginValidateRequest> = yield take(
      getType(pinLoginValidateRequest)
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
