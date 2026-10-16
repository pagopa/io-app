import { Millisecond } from "@pagopa/ts-commons/lib/units";
// watch for all actions regarding Zendesk
import { call, put, select, take, takeLatest } from "typed-redux-saga/macro";

import { startTimer } from "../../../utils/timer";
import {
  emailValidationPollingStart,
  profileLoadRequest,
  profileLoadSuccess
} from "../../settings/common/store/actions";
import { emailValidationSelector } from "../store/selectors/emailValidation";

const GET_PROFILE_POLLING_INTERVAL = 5000 as Millisecond;

export function* watchEmailValidationSaga() {
  yield* takeLatest(emailValidationPollingStart, emailValidationPollingLoop);
}

function* emailValidationPollingLoop() {
  // eslint-disable-next-line functional/no-let
  let profilePollingIsRunning = true;

  while (profilePollingIsRunning) {
    yield* call(startTimer, GET_PROFILE_POLLING_INTERVAL);

    yield* put(profileLoadRequest());
    yield* take(profileLoadSuccess);
    const isEmailValidationSelector = yield* select(emailValidationSelector);
    profilePollingIsRunning =
      isEmailValidationSelector.isEmailValidationPollingRunning;
  }
}
