import { Effect } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";
import { getType } from "typesafe-actions";

import { startApplicationInitialization } from "../../store/actions/application";
import { sessionInvalid } from "../../store/actions/authentication";
import { startPinReset } from "../../store/actions/pinset";

import { deletePin } from "../../utils/keychain";

export function* watchPinResetSaga(): Iterator<Effect> {
  yield takeEvery(getType(startPinReset), function*() {
    // Delete the current PIN from the Keychain
    // tslint:disable-next-line:saga-yield-return-type
    yield call(deletePin);
    // invalidate the session
    yield put(sessionInvalid());
    // initialize the app from scratch (forcing an onboarding flow)
    yield put(startApplicationInitialization());
  });
}
