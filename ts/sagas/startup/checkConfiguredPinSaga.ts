import * as O from "fp-ts/lib/Option";
import { call, take, select } from "typed-redux-saga/macro";
import { CommonActions } from "@react-navigation/native";
import { navigateToOnboardingPinScreenAction } from "../../store/actions/navigation";
import { createPinSuccess } from "../../features/settings/security/store/actions/pinset";

import { PinString } from "../../types/PinString";
import { ReduxSagaEffect } from "../../types/utils";

import { getPin } from "../../utils/keychain";
import NavigationService from "../../navigation/NavigationService";
import { isFastLoginEnabledSelector } from "../../features/authentication/fastLogin/store/selectors";
import { isValidPinNumber } from "../../features/authentication/fastLogin/utils/pinPolicy";
import ROUTES from "../../navigation/routes";

export function* checkConfiguredPinSaga(): Generator<
  ReduxSagaEffect,
  PinString,
  any
> {
  // We check whether the user has already created a unlock code by trying to retrieve
  // it from the Keychain
  const pinCode = yield* call(getPin);

  if (O.isSome(pinCode)) {
    const isFastLoginEnabled = yield* select(isFastLoginEnabledSelector);
    if (isFastLoginEnabled) {
      if (isValidPinNumber(pinCode.value)) {
        return pinCode.value;
      }
    } else {
      return pinCode.value;
    }
  }

  // Go through the unlock code configuration screen
  yield* call(navigateToOnboardingPinScreenAction);

  // and block until a unlock code is set
  const resultAction = yield* take(createPinSuccess);
  yield* call(
    NavigationService.dispatchNavigationAction,
    // We use navigate to go back to the main tab
    // https://reactnavigation.org/docs/nesting-navigators/#navigation-actions-are-handled-by-current-navigator-and-bubble-up-if-couldnt-be-handled
    CommonActions.navigate({
      name: ROUTES.MAIN,
      // If for some reason, we have navigation params
      // we want to merge them going back to the main tab.
      merge: true
    })
  );

  return resultAction.payload;
}
