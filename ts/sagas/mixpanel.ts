import { call, Effect, select, takeLatest } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { initializeMixPanel, optOut } from "../mixpanel";
import { setMixpanelEnabled } from "../store/actions/mixpanel";
import { isMixpanelEnabled } from "../store/reducers/persistedPreferences";

export function* initMixpanel(): Generator<Effect, void, boolean> {
  const isMixpanelEnabledResult: ReturnType<typeof isMixpanelEnabled> = yield select(
    isMixpanelEnabled
  );

  if (isMixpanelEnabledResult ?? true) {
    // initialize mixpanel
    yield call(initializeMixPanel);
  }

  yield takeLatest(setMixpanelEnabled, handleSetMixpanelEnabled);
}

function* handleSetMixpanelEnabled(
  action: ActionType<typeof setMixpanelEnabled>
) {
  if (action.payload) {
    yield call(initializeMixPanel);
  } else {
    yield call(optOut);
  }
}
