/**
 * A saga to manage notifications
 */
import {
  TypeofApiCall,
  TypeOfApiResponseStatus
} from "italia-ts-commons/lib/requests";
import { Platform } from "react-native";
import { call, Effect, put, select } from "redux-saga/effects";

import { PlatformEnum } from "../../definitions/backend/Platform";
import { CreateOrUpdateInstallationT } from "../api/backend";
import { updateNotificationInstallationFailure } from "../store/actions/notifications";
import { notificationsInstallationSelector } from "../store/reducers/notifications/installation";
import { SagaCallReturnType } from "../types/utils";

const notificationsPlatform: PlatformEnum = Platform.select({
  ios: PlatformEnum.apns,
  android: PlatformEnum.gcm
});

/**
 * This generator function calls the ProxyApi `installation` endpoint
 */
export function* updateInstallationSaga(
  createOrUpdateInstallation: TypeofApiCall<CreateOrUpdateInstallationT>
): Iterator<
  Effect | TypeOfApiResponseStatus<CreateOrUpdateInstallationT> | undefined
> {
  // Get the notifications installation data from the store
  const notificationsInstallation: ReturnType<
    typeof notificationsInstallationSelector
  > = yield select(notificationsInstallationSelector);

  // Check if the notification server token is available (non available on iOS simulator)
  if (notificationsInstallation.token === undefined) {
    return undefined;
  }
  // Send the request to the backend
  const response: SagaCallReturnType<
    typeof createOrUpdateInstallation
  > = yield call(createOrUpdateInstallation, {
    id: notificationsInstallation.id,
    installation: {
      platform: notificationsPlatform,
      pushChannel: notificationsInstallation.token
    }
  });

  /**
   * If the response is undefined (can't be decoded) or the status is not 200 dispatch a failure action
   */
  if (response === undefined || response.status !== 200) {
    yield put(updateNotificationInstallationFailure());
  }

  return response === undefined ? undefined : response.status;
}
