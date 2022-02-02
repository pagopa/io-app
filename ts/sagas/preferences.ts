import { getLanguages } from "react-native-i18n";
import { call, put, Effect } from "typed-redux-saga";
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
