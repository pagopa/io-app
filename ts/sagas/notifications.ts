/**
 * A saga to manage notifications
 */

import { BasicResponseType } from "italia-ts-commons/lib/requests";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { Platform } from "react-native";
import { call, Effect, put, select, takeLatest } from "redux-saga/effects";

import { PlatformEnum } from "../../definitions/backend/Platform";
import { BackendClient } from "../api/backend";
import { apiUrlPrefix } from "../config";
import { SESSION_INITIALIZE_SUCCESS } from "../store/actions/constants";
import { updateNotificationInstallationFailure } from "../store/actions/notifications";
import {
  InstallationState,
  notificationsInstallationSelector
} from "../store/reducers/notifications/installation";
import { sessionTokenSelector } from "../store/reducers/session";
import { SessionToken } from "../types/SessionToken";

const notificationsPlatform: PlatformEnum = Platform.select({
  ios: PlatformEnum.apns,
  android: PlatformEnum.gcm
});

/**
 * This generator function calls the ProxyApi `installation` endpoint
 */
function* updateInstallation(): Iterator<Effect> {
  // Get the notifications installation data from the store
  const notificationsInstallation: InstallationState = yield select(
    notificationsInstallationSelector
  );

  // Get the token from the state
  const sessionToken: SessionToken | undefined = yield select(
    sessionTokenSelector
  );

  // Check if the we have a session token
  // TODO: Define what to do when the token is not available or is expired
  // https://www.pivotaltracker.com/story/show/156839083
  if (sessionToken) {
    // Check if the notification server token is available (non available on iOS simulator)
    if (notificationsInstallation.token) {
      // Send the request to the backend
      const backendClient = BackendClient(apiUrlPrefix, sessionToken);

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
       * If the response is undefined (can't be decoded) or the status is not 200 dispatch a failure action
       */
      if (!response || response.status !== 200) {
        yield put(updateNotificationInstallationFailure());
      }
    }
  }
}

export default function* root(): Iterator<Effect> {
  yield takeLatest(SESSION_INITIALIZE_SUCCESS, updateInstallation);
}
