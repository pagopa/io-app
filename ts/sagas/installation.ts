/**
 * A saga to manage notifications
 */
import { call, Effect, put, select } from "redux-saga/effects";

import { sessionInvalid } from "../store/actions/authentication";
import { previousInstallationDataDeleteSuccess } from "../store/actions/installation";
import { isFirstRunAfterInstallSelector } from "../store/reducers/installation";
import { GlobalState } from "../store/reducers/types";
import { deletePin } from "../utils/keychain";

/**
 * This generator function removes user data from previous application
 * installation
 */
export function* previousInstallationDataDeleteSaga(): IterableIterator<
  Effect
> {
  const isFirstRunAfterInstall: ReturnType<
    typeof isFirstRunAfterInstallSelector
  > = yield select<GlobalState>(isFirstRunAfterInstallSelector);

  if (isFirstRunAfterInstall) {
    // Delete the current PIN from the Keychain
    // tslint:disable-next-line:saga-yield-return-type
    yield call(deletePin);
    // invalidate the session
    yield put(sessionInvalid());

    yield put(previousInstallationDataDeleteSuccess());
  }
}
