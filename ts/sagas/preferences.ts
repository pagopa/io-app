import { getLanguages } from "react-native-i18n";

import { Effect } from "redux-saga";
import { call, put } from "redux-saga/effects";
import { preferencesLanguagesLoadSuccess } from "../store/actions/preferences";
import { SagaCallReturnType } from "../types/utils";

/**
 * A saga that retrieves the system languages
 */
export function* loadSystemPreferencesSaga(): IterableIterator<Effect> {
  const languages: SagaCallReturnType<typeof getLanguages> = yield call(
    getLanguages,
    {}
  );
  yield put(preferencesLanguagesLoadSuccess(languages));
}
