import { put, select, takeLatest } from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { setOfflineAccessReason } from "../store/actions";
import { itwLifecycleIsOperationalOrValid } from "../../itwallet/lifecycle/store/selectors";
import { isItwOfflineAccessEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { offlineAccessReasonSelector } from "../store/selectors";
import { OfflineAccessReasonEnum } from "../store/reducer";
import { startupLoadSuccess } from "../../../store/actions/startup";
import { StartupStatusEnum } from "../../../store/reducers/startup";

export function* exitFromStartupSaga() {
  const selectItwLifecycleIsOperationalOrValid = yield* select(
    itwLifecycleIsOperationalOrValid
  );
  const isOfflineAccessEnabled = yield* select(
    isItwOfflineAccessEnabledSelector
  );

  const offlineAccessReason = yield* select(offlineAccessReasonSelector);

  if (
    selectItwLifecycleIsOperationalOrValid &&
    isOfflineAccessEnabled &&
    offlineAccessReason === OfflineAccessReasonEnum.SESSION_REFRESH
  ) {
    yield* put(startupLoadSuccess(StartupStatusEnum.OFFLINE));
  }
}

export function* watchSessionRefreshInOfflineSaga() {
  yield* takeLatest(getType(setOfflineAccessReason), exitFromStartupSaga);
}
