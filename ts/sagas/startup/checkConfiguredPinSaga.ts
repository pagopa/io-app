import { Option } from "fp-ts/lib/Option";
import { Effect } from "redux-saga";
import { call } from "redux-saga/effects";

import { getPin } from "../../utils/keychain";

import { PinString } from "../../types/PinString";
import { SagaCallReturnType } from "../../types/utils";

import { configurePinSaga } from "./configurePinSaga";

// tslint:disable-next-line:cognitive-complexity
export function* checkConfiguredPinSaga(): IterableIterator<Effect> {
  // We check whether the user has already created a PIN by trying to retrieve
  // it from the Keychain
  const pinCode: Option<PinString> = yield call(getPin);

  if (pinCode.isNone()) {
    // If a PIN has not been configured yet...
    while (true) {
      // Go through the PIN configuration flow until a PIN is set.
      const configurePinResult: SagaCallReturnType<
        typeof configurePinSaga
      > = yield call(configurePinSaga);
      // FIXME: handle errors
      if (configurePinResult) {
        break;
      }
    }
  }
}
