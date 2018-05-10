import { Effect, select, takeLatest, call } from "redux-saga/effects";

import { SESSION_INITIALIZE_SUCCESS } from "../store/actions/constants";
import {
  InstallationState,
  notificationsInstallationSelector
} from "../store/reducers/notifications/installation";
import { proxyApi } from "../api/api";
import { ApiResponse } from "apisauce";
import { Platform } from "react-native";

const notificationsPlatform = Platform.select({
  ios: "apns",
  android: "gcm"
});

function* manageInstallation(): Iterator<Effect> {
  // Get the notifications installation data
  const notificationsInstallation: InstallationState = yield select(
    notificationsInstallationSelector
  );

  if (notificationsInstallation.token) {
    const response: ApiResponse<void> = yield call(
      proxyApi.updateInstallation,
      {
        uuid: notificationsInstallation.uuid,
        token: notificationsInstallation.token,
        platform: notificationsPlatform
      }
    );
  }
}

export default function* root(): Iterator<Effect> {
  yield takeLatest(SESSION_INITIALIZE_SUCCESS, manageInstallation);
}
