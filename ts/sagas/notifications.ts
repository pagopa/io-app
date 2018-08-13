/**
 * A saga to manage notifications
 */
import {
  BasicResponseType,
  TypeofApiCall
} from "italia-ts-commons/lib/requests";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { Platform } from "react-native";
import { call, Effect, put, select } from "redux-saga/effects";

import { PlatformEnum } from "../../definitions/backend/Platform";
import { CreateOrUpdateInstallationT } from "../api/backend";
import { updateNotificationInstallationFailure } from "../store/actions/notifications";
import { notificationsInstallationSelector } from "../store/reducers/notifications/installation";

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
  const notificationsInstallation: ReturnType<
    typeof notificationsInstallationSelector
  > = yield select(notificationsInstallationSelector);

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
