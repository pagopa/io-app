import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";

import { some } from "fp-ts/lib/Option";

import { getPin } from "../../../utils/keychain";

import { PinString } from "../../../types/PinString";

import { configurePinSaga } from "../../pinset";

import { checkConfiguredPinSaga } from "../checkConfiguredPinSaga";

const aPinString = "pin" as PinString;

describe("checkConfiguredPinSaga", () => {
  it("should do nothing if user has already configured the PIN", () => {
    return expectSaga(checkConfiguredPinSaga)
      .provide([[matchers.call(getPin), some(aPinString)]])
      .not.call.fn(configurePinSaga)
      .run();
  });
});
