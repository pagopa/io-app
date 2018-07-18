/**
 * A saga that manages the Pinlogin.
 *
 * For a detailed view of the flow check @https://docs.google.com/document/d/1le-IdjcGWtmfrMzh6d_qTwsnhVNCExbCd6Pt4gX7VGo/edit
 */

import {
  NavigationActions,
  NavigationNavigateActionPayload
} from "react-navigation";
import { Action } from "redux";
import {
  all,
  call,
  Effect,
  put,
  PutEffect,
  select,
  takeLatest
} from "redux-saga/effects";
import ROUTES from "../navigation/routes";
import {
  PIN_LOGIN_INITIALIZE,
  PIN_LOGIN_VALIDATE_REQUEST
} from "../store/actions/constants";
import { navigateToDeeplink } from "../store/actions/deeplink";
import {
  pinFailure,
  pinSuccess,
  PinValidateRequest
} from "../store/actions/pinlogin";
import { deeplinkSelector } from "../store/reducers/deeplink";
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
    const basePin: string = yield call(getPin);

    if (basePin === userPin) {
      const deeplink: NavigationNavigateActionPayload | null = yield select(
        deeplinkSelector
      );
      // tslint:disable-next-line:readonly-array array-type
      const actionsToDispatch: Array<PutEffect<Action>> = [put(pinSuccess())];

      // If a deeplink has been setted, navigate to deeplink, otherwise to the MainNavigator
      if (deeplink) {
        actionsToDispatch.push(put(navigateToDeeplink(deeplink)));
      } else {
        actionsToDispatch.push(
          put(
            NavigationActions.navigate({
              routeName: ROUTES.MAIN,
              key: undefined
            })
          )
        );
      }

      yield all(actionsToDispatch);
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
