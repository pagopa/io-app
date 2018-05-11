/**
 * A saga to manage notifications
 */

import { Platform } from "react-native";
import { call, Effect, select, takeLatest } from "redux-saga/effects";

import { proxyApi } from "../api";
import { SESSION_INITIALIZE_SUCCESS } from "../store/actions/constants";
import {
  InstallationState,
  notificationsInstallationSelector
} from "../store/reducers/notifications/installation";
import { callApi } from "./utils/apiCaller";

const notificationsPlatform = Platform.select({
  ios: "apns",
  android: "gcm"
});

/**
 * This generator function calls the ProxyApi `installation` endpoint
 */
function* updateInstallation(): Iterator<Effect> {
  // Get the notifications installation data from the store
  const notificationsInstallation: InstallationState = yield select(
    notificationsInstallationSelector
  );

  // Check if the notification server token is available
  if (notificationsInstallation.token) {
    yield call(callApi, proxyApi.updateInstallation, {
      uuid: notificationsInstallation.uuid,
      token: notificationsInstallation.token,
      platform: notificationsPlatform
    });
  }
}

export default function* root(): Iterator<Effect> {
  yield takeLatest(SESSION_INITIALIZE_SUCCESS, updateInstallation);
}
