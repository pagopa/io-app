import { Option } from "fp-ts/lib/Option";
import { Effect } from "redux-saga";
import { call, put, take } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";

import { getPin } from "../../utils/keychain";

import { PinString } from "../../types/PinString";

import { navigateToOnboardingPinScreenAction } from "../../store/actions/navigation";
import { createPinSuccess } from "../../store/actions/pinset";

export function* checkConfiguredPinSaga(): IterableIterator<
  Effect | PinString
> {
  // We check whether the user has already created a unlock code by trying to retrieve
  // it from the Keychain
  const pinCode: Option<PinString> = yield call(getPin);

  if (pinCode.isSome()) {
    return pinCode.value;
  }

  // Go through the unlock code configuration screen
  yield put(navigateToOnboardingPinScreenAction);

  // and block until a unlock code is set
  const resultAction: ActionType<typeof createPinSuccess> = yield take(
    getType(createPinSuccess)
  );

  return resultAction.payload;
}
