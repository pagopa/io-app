import { call, take } from "typed-redux-saga/macro";

import { navigateToOnboardingPinScreenAction } from "../../store/actions/navigation";
import { createPinSuccess } from "../../store/actions/pinset";

import { PinString } from "../../types/PinString";
import { ReduxSagaEffect } from "../../types/utils";

import { getPin } from "../../utils/keychain";

export function* checkConfiguredPinSaga(): Generator<
  ReduxSagaEffect,
  PinString,
  any
> {
  // We check whether the user has already created a unlock code by trying to retrieve
  // it from the Keychain
  const pinCode = yield* call(getPin);

  if (pinCode.isSome()) {
    return pinCode.value;
  }

  // Go through the unlock code configuration screen
  yield* call(navigateToOnboardingPinScreenAction);

  // and block until a unlock code is set
  const resultAction = yield* take(createPinSuccess);

  return resultAction.payload;
}
