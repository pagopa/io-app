/**
 * A saga to manage session invalidation
 */
import { call, select } from "typed-redux-saga/macro";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isFirstRunAfterInstallSelector } from "../store/reducers/installation";
import { ReduxSagaEffect } from "../types/utils";

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
    yield* call(AsyncStorage.removeItem, "persist:authentication");
  }
}
