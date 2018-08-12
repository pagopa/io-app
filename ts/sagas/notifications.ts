/**
 * A saga to manage notifications
 */
import {
  BasicResponseType,
  TypeofApiCall
} from "italia-ts-commons/lib/requests";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { Platform } from "react-native";
import { call, Effect, put, select, takeLatest } from "redux-saga/effects";

import { PlatformEnum } from "../../definitions/backend/Platform";
import { BackendClient, CreateOrUpdateInstallationT } from "../api/backend";
import { apiUrlPrefix } from "../config";
import { updateNotificationInstallationFailure } from "../store/actions/notifications";
import { sessionTokenSelector } from "../store/reducers/authentication";
import {
  InstallationState,
  notificationsInstallationSelector
} from "../store/reducers/notifications/installation";
import { SessionToken } from "../types/SessionToken";

const notificationsPlatform: PlatformEnum = Platform.select({
  ios: PlatformEnum.apns,
  android: PlatformEnum.gcm
});

/**
 * This generator function calls the ProxyApi `installation` endpoint
 */
export function* updateInstallationSaga(
  createOrUpdateInstallation: TypeofApiCall<CreateOrUpdateInstallationT>
): Iterator<Effect> {
  // Get the notifications installation data from the store
  const notificationsInstallation: InstallationState = yield select(
    notificationsInstallationSelector
  );

  // Check if the notification server token is available (non available on iOS simulator)
  if (notificationsInstallation.token) {
    // Send the request to the backend

    const response: BasicResponseType<NonEmptyString> | undefined = yield call(
      createOrUpdateInstallation,
      {
        id: notificationsInstallation.uuid,
        installation: {
          platform: notificationsPlatform,
          pushChannel: notificationsInstallation.token
        }
      }
    );

    /**
     * If the response is undefined (can't be decoded) or the status is not 200 dispatch a failure action
     */
    if (!response || response.status !== 200) {
      yield put(updateNotificationInstallationFailure());
    }
  }
}
