import i18next from "i18next";
import { put } from "typed-redux-saga/macro";
import { preferencesLanguagesLoadSuccess } from "../store/actions/preferences";
import { ReduxSagaEffect, SagaCallReturnType } from "../types/utils";

/**
 * A saga that retrieves the system languages
 */
export function* loadSystemPreferencesSaga(): Generator<
  ReduxSagaEffect,
  void,
  SagaCallReturnType<any>
> {
  const languages = i18next.languages;
  yield* put(preferencesLanguagesLoadSuccess(languages));
}
