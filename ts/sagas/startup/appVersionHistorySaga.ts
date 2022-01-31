import { put } from "redux-saga/effects";
import { getAppVersion } from "../../utils/appVersion";
import { appVersionHistory } from "../../store/actions/installation";

/**
 * get the current version of the app and dispatch an action
 * with that version
 */
export function* checkAppHistoryVersionSaga() {
  const currentVersion = getAppVersion();
  yield put(appVersionHistory(currentVersion));
}
