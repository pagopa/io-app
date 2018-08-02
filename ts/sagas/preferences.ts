import { getLanguages } from "react-native-i18n";

import { Effect } from "redux-saga";
import { call, put } from "redux-saga/effects";
import { preferencesLanguagesLoadSuccess } from "../store/actions/preferences";

/**
 * A saga that retrieves the system languages
 */
export default function* root(): IterableIterator<Effect> {
  // tslint:disable-next-line:readonly-array
  const languages: string[] = yield call(getLanguages, {});
  yield put(preferencesLanguagesLoadSuccess(languages));
}
