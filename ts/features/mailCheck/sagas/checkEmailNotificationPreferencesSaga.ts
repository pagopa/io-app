import * as pot from "@pagopa/ts-commons/lib/pot";
import { SagaIterator } from "redux-saga";
import {
  cancel,
  fork,
  put,
  select,
  take,
  takeEvery
} from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { customEmailChannelSetEnabled } from "../../../store/actions/persistedPreferences";
import { profileLoadSuccess } from "../../settings/common/store/actions";
import { isCustomEmailChannelEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { ReduxSagaEffect } from "../../../types/utils";

/**
 * A saga to match at the first startup if the user has customized settings related to the
 * forwarding of notifications on the verified email within previous installations
 */
export function* watchEmailNotificationPreferencesSaga(): Generator<
  ReduxSagaEffect,
  void,
  any
> {
  const isCustomEmailChannelEnabled: ReturnType<
    typeof isCustomEmailChannelEnabledSelector
  > = yield* select(isCustomEmailChannelEnabledSelector);

  // if we know about user choice do nothing
  if (pot.isSome(isCustomEmailChannelEnabled)) {
    return;
  }

  // check if the user has any services with blocked email channel
  const checkSaga = yield* fork(checkEmailNotificationPreferencesSaga);
  yield* take(customEmailChannelSetEnabled);
  yield* cancel(checkSaga);
}

export function* checkEmailNotificationPreferencesSaga(): SagaIterator {
  yield* takeEvery(
    getType(profileLoadSuccess),
    emailNotificationPreferencesSaga
  );
}

export function* emailNotificationPreferencesSaga(): SagaIterator {
  yield* put(customEmailChannelSetEnabled(false));
}
