/**
 * A saga that manages the Onboarding.
 *
 * For a detailed view of the flow check @https://docs.google.com/document/d/1le-IdjcGWtmfrMzh6d_qTwsnhVNCExbCd6Pt4gX7VGo/edit
 */

import { NavigationActions } from "react-navigation";
import { call, Effect, put, takeLatest } from "redux-saga/effects";

import ROUTES from "../navigation/routes";
import {
  PIN_LOGIN_INITIALIZE,
  PIN_LOGIN_VALIDATE_FAILURE,
  PIN_LOGIN_VALIDATE_REQUEST
} from "../store/actions/constants";
import { PinValidateRequest } from "../store/actions/pinlogin";
import { getPin } from "../utils/keychain";

/**
 * The PIN step of the pin login
 */
function* pinloginSaga(): Iterator<Effect> {
  const navigateToPinForgotNavigatorAction = NavigationActions.navigate({
    routeName: ROUTES.PINLOGIN,
    key: undefined
  });
  yield put(navigateToPinForgotNavigatorAction);
}
function* validatePinSaga(action: PinValidateRequest): Iterator<Effect> {
  try {
    const userPin = action.payload;
    const basePin = yield call(getPin);
    if (basePin === userPin) {
      // Navigate to the MainNavigator
      const navigateToPinValidNavigatorAction = NavigationActions.navigate({
        routeName: ROUTES.MAIN,
        key: undefined
      });
      yield put(navigateToPinValidNavigatorAction);
    } else {
      yield put({
        type: PIN_LOGIN_VALIDATE_FAILURE
      });
    }
  } catch (error) {
    yield put({
      type: PIN_LOGIN_VALIDATE_FAILURE
    });
  }
}

export default function* root(): Iterator<Effect> {
  yield takeLatest(PIN_LOGIN_INITIALIZE, pinloginSaga);
  yield takeLatest(PIN_LOGIN_VALIDATE_REQUEST, validatePinSaga);
}
