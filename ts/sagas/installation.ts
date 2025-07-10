/**
 * A saga to manage session invalidation
 */
import { put, select } from "typed-redux-saga/macro";
import { isFirstRunAfterInstallSelector } from "../store/reducers/installation";
import { ReduxSagaEffect } from "../types/utils";
import { clearCurrentSession } from "../features/authentication/common/store/actions";
import { previousInstallationDataDeleteSuccess } from "../store/actions/installation";

/**
 * This generator function removes user data from previous application
 * installation
 */
export function* previousInstallationDataDeleteSaga(): Generator<
  ReduxSagaEffect,
  void,
  boolean
> {
  const isFirstRunAfterInstall: ReturnType<
    typeof isFirstRunAfterInstallSelector
  > = yield* select(isFirstRunAfterInstallSelector);

  if (isFirstRunAfterInstall) {
    // remove authentication data from the storage
    yield* put(clearCurrentSession());
  }
  yield* put(previousInstallationDataDeleteSuccess());
}
