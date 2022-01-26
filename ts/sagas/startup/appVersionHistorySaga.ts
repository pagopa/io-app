import { put } from "redux-saga/effects";
import { getAppVersion } from "../../utils/appVersion";
import { appVersionHistory } from "../../store/actions/installation";

/**
 *
 */
export function* checkAppHistoryVersionSaga() {
  const currentVersion = getAppVersion();
  yield put(appVersionHistory(currentVersion));
}
