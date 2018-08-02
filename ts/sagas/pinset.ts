/**
 * A saga that handles setting/resetting the PIN.
 *
 * For a detailed view of the flow check
 * @https://docs.google.com/document/d/1le-IdjcGWtmfrMzh6d_qTwsnhVNCExbCd6Pt4gX7VGo/edit
 */

import { NavigationActions } from "react-navigation";
import { call, Effect, fork, put, take } from "redux-saga/effects";

import ROUTES from "../navigation/routes";
import {
  PIN_CREATE_FAILURE,
  PIN_CREATE_REQUEST,
  PIN_CREATE_SUCCESS,
  START_PIN_RESET,
  START_PIN_SET
} from "../store/actions/constants";
import { PinCreateRequest } from "../store/actions/pinset";

import { logoutRequest } from "../store/actions/authentication";
import { deletePin, setPin } from "../utils/keychain";

function* watchPinSetSaga(): Iterator<Effect> {
  while (true) {
    // wait for the PIN set flow to start
    yield take(START_PIN_SET);

    // Navigate to the PinScreen
    const navigateToOnboardingPinScreenAction = NavigationActions.navigate({
      routeName: ROUTES.ONBOARDING,
      action: NavigationActions.navigate({ routeName: ROUTES.ONBOARDING_PIN })
    });
    yield put(navigateToOnboardingPinScreenAction);

    // Loop until PIN successfully saved in the Keystore
    // tslint:disable-next-line:no-constant-condition
    while (true) {
      // Here we wait the user to complete the UI flow
      const action: PinCreateRequest = yield take(PIN_CREATE_REQUEST);

      try {
        const result: boolean = yield call(setPin, action.payload);
        if (!result) {
          throw Error("Cannot store PIN");
        }
        // We created a PIN, trigger a success
        yield put({ type: PIN_CREATE_SUCCESS });
      } catch (error) {
        // We couldn't set a new PIN, trigger a failure
        yield put({ type: PIN_CREATE_FAILURE });
      }

      break;
    }
  }
}

function* watchPinResetSaga(): Iterator<Effect> {
  while (true) {
    // wait for a request to start the PIN reset flow
    yield take(START_PIN_RESET);

    // Logout the user
    yield put(logoutRequest());

    // and delete the current PIN from the Keychain
    // tslint:disable-next-line:saga-yield-return-type
    yield call(deletePin);
  }
}

export default function* root(): Iterator<Effect> {
  yield fork(watchPinSetSaga);
  yield fork(watchPinResetSaga);
}
