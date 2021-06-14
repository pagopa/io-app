import { call, Effect, select } from "redux-saga/effects";
import { initializeMixPanel } from "../mixpanel";
import { isMixpanelEnabled } from "../store/reducers/persistedPreferences";

export function* initMixpanel(): Generator<Effect, void, boolean> {
  const isMixpanelEnabledResult: ReturnType<typeof isMixpanelEnabled> = yield select(
    isMixpanelEnabled
  );

  if (isMixpanelEnabledResult) {
    // initialize mixpanel
    yield call(initializeMixPanel);
  }
}
