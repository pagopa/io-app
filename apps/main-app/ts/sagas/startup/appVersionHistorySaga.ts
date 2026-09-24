import { put } from "typed-redux-saga/macro";

import { appVersionHistory } from "../../store/actions/installation";
import { getAppVersion } from "../../utils/appVersion";

/** Get the current version of the app and dispatch an action with that version */
export function* checkAppHistoryVersionSaga() {
  const currentVersion = getAppVersion();
  yield* put(appVersionHistory(currentVersion));
}
