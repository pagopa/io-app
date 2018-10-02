import { Effect } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";

import { startApplicationInitialization } from "../../store/actions/application";
import { sessionInvalid } from "../../store/actions/authentication";
import { START_PIN_RESET } from "../../store/actions/constants";

import { deletePin } from "../../utils/keychain";

export function* watchPinResetSaga(): Iterator<Effect> {
  yield takeEvery(START_PIN_RESET, function*() {
    // Delete the current PIN from the Keychain
    // tslint:disable-next-line:saga-yield-return-type
    yield call(deletePin);
    // invalidate the session
    yield put(sessionInvalid());
    // initialize the app from scratch (forcing an onboarding flow)
    yield put(startApplicationInitialization());
  });
}
