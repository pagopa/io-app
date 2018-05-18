/**
 * A saga to manage notifications
 */

import { BasicResponseType } from "italia-ts-commons/lib/requests";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { Alert, Platform } from "react-native";
import { call, Effect, select, takeLatest } from "redux-saga/effects";

import { PlatformEnum } from "../../definitions/backend/Platform";
import { BackendClient } from "../api/backend";
import { apiUrlPrefix, environment } from "../config";
import I18n from "../i18n";
import { SESSION_INITIALIZE_SUCCESS } from "../store/actions/constants";
import {
  InstallationState,
  notificationsInstallationSelector
} from "../store/reducers/notifications/installation";
import { sessionTokenSelector } from "../store/reducers/session";

const notificationsPlatform: PlatformEnum = Platform.select({
  ios: PlatformEnum.apns,
  android: PlatformEnum.gcm
});

function notifyNotificationsInstallationError() {
  // If the application is running in dev mode show an alert
  if (environment === "DEV") {
    Alert.alert(
      I18n.t("notifications.installation.errorTitle"),
      I18n.t("notifications.installation.errorMessage")
    );
  }
}

/**
 * This generator function calls the ProxyApi `installation` endpoint
 */
function* updateInstallation(): Iterator<Effect> {
  // Get the notifications installation data from the store
  const notificationsInstallation: InstallationState = yield select(
    notificationsInstallationSelector
  );

  // Get the token from the state
  const sessionToken: string | undefined = yield select(sessionTokenSelector);

  // Check if the we have a session token
  // TODO: Define what to do when the token is not available or is expired
  // https://www.pivotaltracker.com/story/show/156839083
  if (sessionToken) {
    // Check if the notification server token is available (non available on iOS simulator)
    if (notificationsInstallation.token) {
      // Send the request to the backend
      const backendClient = BackendClient(apiUrlPrefix, sessionToken);

      try {
        const response:
          | BasicResponseType<NonEmptyString>
          | undefined = yield call(backendClient.createOrUpdateInstallation, {
          id: notificationsInstallation.uuid,
          installation: {
            platform: notificationsPlatform,
            pushChannel: notificationsInstallation.token
          }
        });

        /**
         * If the response is undefined (can't be decoded) or the status is not 200 notify the problem
         */
        if (!response || response.status !== 200) {
          notifyNotificationsInstallationError();
        }
      } catch (error) {
        notifyNotificationsInstallationError();
      }
    }
  }
}

export default function* root(): Iterator<Effect> {
  yield takeLatest(SESSION_INITIALIZE_SUCCESS, updateInstallation);
}
