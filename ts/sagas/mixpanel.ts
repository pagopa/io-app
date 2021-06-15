import { call, Effect, select } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { optInMixpanel, optOutMixpanel } from "../mixpanel";
import { setMixpanelEnabled } from "../store/actions/mixpanel";
import { isMixpanelEnabled } from "../store/reducers/persistedPreferences";

export function* initMixpanel(): Generator<Effect, void, boolean> {
  const isMixpanelEnabledResult: ReturnType<typeof isMixpanelEnabled> = yield select(
    isMixpanelEnabled
  );

  if (isMixpanelEnabledResult ?? true) {
    // initialize mixpanel
    yield call(optInMixpanel);
  }
}

export function* handleSetMixpanelEnabled(
  action: ActionType<typeof setMixpanelEnabled>
) {
  if (action.payload) {
    yield call(optInMixpanel);
  } else {
    yield call(optOutMixpanel);
  }
}
