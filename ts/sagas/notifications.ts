import { Platform } from "react-native";
import { delay } from "redux-saga";
import { call, Effect, select, takeLatest } from "redux-saga/effects";

import { proxyApi } from "../api";
import { SESSION_INITIALIZE_SUCCESS } from "../store/actions/constants";
import {
  InstallationState,
  notificationsInstallationSelector
} from "../store/reducers/notifications/installation";
import { callApiWithRetries } from "./utils/apiCaller";

const notificationsPlatform = Platform.select({
  ios: "apns",
  android: "gcm"
});

function* updateInstallation(): Iterator<Effect> {
  // Get the notifications installation data
  yield call(delay, 20000);
  const notificationsInstallation: InstallationState = yield select(
    notificationsInstallationSelector
  );

  if (notificationsInstallation.token) {
    yield call(
      callApiWithRetries,
      proxyApi.updateInstallation,
      {
        RETRIES: 5,
        RETRIES_DELAY: 2500
      },
      {
        uuid: notificationsInstallation.uuid,
        token: notificationsInstallation.token,
        platform: notificationsPlatform
      }
    );
  }
}

export default function* root(): Iterator<Effect> {
  yield takeLatest(SESSION_INITIALIZE_SUCCESS, updateInstallation);
}
