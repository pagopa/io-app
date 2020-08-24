import { getLanguages } from "react-native-i18n";

import { Effect } from "redux-saga/effects";
import { call, put } from "redux-saga/effects";
import { preferencesLanguagesLoadSuccess } from "../store/actions/preferences";
import { SagaCallReturnType } from "../types/utils";

/**
 * A saga that retrieves the system languages
 */
export function* loadSystemPreferencesSaga(): Generator<
  Effect,
  void,
  SagaCallReturnType<typeof getLanguages>
> {
  const languages = yield call(getLanguages);
  yield put(preferencesLanguagesLoadSuccess(languages));
}
