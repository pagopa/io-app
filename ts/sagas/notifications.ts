import { Effect, select, takeLatest } from "redux-saga/effects";

import { SESSION_INITIALIZE_SUCCESS } from "../store/actions/constants";
import {
  InstallationState,
  notificationsInstallationSelector
} from "../store/reducers/notifications/installation";

function* manageInstallation(): Iterator<Effect> {
  // Get the notifications token
  let notificationsInstallation: InstallationState = yield select(
    notificationsInstallationSelector
  );
}

export default function* root(): Iterator<Effect> {
  yield takeLatest(SESSION_INITIALIZE_SUCCESS, manageInstallation);
}
