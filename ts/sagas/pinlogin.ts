/**
 * A saga that manages the Pinlogin.
 *
 * For a detailed view of the flow check @https://docs.google.com/document/d/1le-IdjcGWtmfrMzh6d_qTwsnhVNCExbCd6Pt4gX7VGo/edit
 */

import { isNone, Option } from "fp-ts/lib/Option";

import {
  NavigationActions,
  NavigationNavigateActionPayload
} from "react-navigation";

import { call, Effect, put, select, takeLatest } from "redux-saga/effects";

import ROUTES from "../navigation/routes";
import {
  PIN_LOGIN_INITIALIZE,
  PIN_LOGIN_VALIDATE_REQUEST
} from "../store/actions/constants";
import { navigateToDeepLink } from "../store/actions/deepLink";
import {
  pinFailure,
  pinSuccess,
  PinValidateRequest
} from "../store/actions/pinlogin";
import { deepLinkSelector } from "../store/reducers/deepLink";
import { PinString } from "../types/PinString";
import { getPin } from "../utils/keychain";

/**
 * The PIN step of the pin login
 */
function* pinLoginSaga(): Iterator<Effect> {
  const navigateToPinLoginNavigatorAction = NavigationActions.navigate({
    routeName: ROUTES.PIN_LOGIN,
    key: undefined
  });
  yield put(navigateToPinLoginNavigatorAction);
}

function* pinValidateSaga(action: PinValidateRequest): Iterator<Effect> {
  try {
    const userPin = action.payload;
    const basePin: Option<PinString> = yield call(getPin);

    if (isNone(basePin)) {
      // no PIN has been set!
      throw Error("Trying to validate a PIN, but the PIN has not been set.");
    }

    if (basePin.value === userPin) {
      yield put(pinSuccess());

      const deepLink: NavigationNavigateActionPayload | null = yield select(
        deepLinkSelector
      );

      // If a deep link has been set, navigate to deep link, otherwise to the MainNavigator
      if (deepLink) {
        yield put(navigateToDeepLink(deepLink));
      } else {
        // Navigate to the MainNavigator
        const navigateToPinValidNavigatorAction = NavigationActions.navigate({
          routeName: ROUTES.MAIN,
          key: undefined
        });
        yield put(navigateToPinValidNavigatorAction);
      }
    } else {
      yield put(pinFailure());
    }
  } catch (error) {
    yield put(pinFailure());
  }
}

export default function* root(): Iterator<Effect> {
  yield takeLatest(PIN_LOGIN_INITIALIZE, pinLoginSaga);
  yield takeLatest(PIN_LOGIN_VALIDATE_REQUEST, pinValidateSaga);
}
