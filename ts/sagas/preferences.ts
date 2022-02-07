import { getLanguages } from "react-native-i18n";
import { call, put } from "typed-redux-saga/macro";
import { preferencesLanguagesLoadSuccess } from "../store/actions/preferences";
import { ReduxSagaEffect, SagaCallReturnType } from "../types/utils";

/**
 * A saga that retrieves the system languages
 */
export function* loadSystemPreferencesSaga(): Generator<
  ReduxSagaEffect,
  void,
  SagaCallReturnType<typeof getLanguages>
> {
  const languages = yield* call(getLanguages);
  yield* put(preferencesLanguagesLoadSuccess(languages));
}
