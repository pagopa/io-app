/**
 * A saga to manage notifications
 */
import { readableReport } from "italia-ts-commons/lib/reporters";
import { Platform } from "react-native";
import { call, put, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { PlatformEnum } from "../../definitions/backend/Platform";
import { BackendClient } from "../api/backend";
import {
  notificationsInstallationTokenRegistered,
  updateNotificationInstallationFailure
} from "../store/actions/notifications";
import { SagaCallReturnType } from "../types/utils";
import { mixpanelTrack } from "../mixpanel";
import configurePushNotification from "../boot/configurePushNotification";
import { notificationsInstallationSelector } from "../store/reducers/notifications/installation";

const notificationsPlatform: PlatformEnum = Platform.select<PlatformEnum>({
  ios: PlatformEnum.apns,
  android: PlatformEnum.gcm,
  default: PlatformEnum.gcm
});

/**
 * send the push notification token to the backend
 * @param pushNotificationToken
 * @param installationID
 * @param createOrUpdateInstallation
 */
export function* updateNotificationToken(
  pushNotificationToken: string,
  installationID: string,
  createOrUpdateInstallation: ReturnType<
    typeof BackendClient
  >["createOrUpdateInstallation"]
) {
  try {
    // Send the request to the backend
    const response: SagaCallReturnType<typeof createOrUpdateInstallation> =
      yield call(createOrUpdateInstallation, {
        installationID,
        installation: {
          platform: notificationsPlatform,
          pushChannel: pushNotificationToken
        }
      });
    /**
     * If the response isLeft (got an error) dispatch a failure action
     */
    if (response.isLeft()) {
      throw Error(readableReport(response.value));
    }
    if (response.value.status === 200) {
      yield put(
        notificationsInstallationTokenRegistered(pushNotificationToken)
      );
    } else {
      yield put(
        updateNotificationInstallationFailure(
          new Error(`response status code ${response.value.status}`)
        )
      );
    }
  } catch (error) {
    yield put(updateNotificationInstallationFailure(error));
  }
}

/**
 * do some check on push notification token
 * - if there is no push notification, ask for a new and then save it to the backend
 * - if there is a push notification token, check if it is the same of the saved one. If not, update it to the backend
 * @param createOrUpdateInstallation
 */
export function* updateInstallationSaga(
  createOrUpdateInstallation: ReturnType<
    typeof BackendClient
  >["createOrUpdateInstallation"]
): SagaIterator {
  const storedPushNotificationToken: ReturnType<
    typeof notificationsInstallationSelector
  > = yield select(notificationsInstallationSelector);
  // Check if the there is push notification token
  if (storedPushNotificationToken.token === undefined) {
    // retrieve a push notification token from Firebase/APNS
    const pushNotificationToken: SagaCallReturnType<
      typeof configurePushNotification
    > = yield call(configurePushNotification);
    // undefined -> dev env
    if (pushNotificationToken !== undefined) {
      // send push notification token to the backend
      yield call(
        updateNotificationToken,
        pushNotificationToken,
        storedPushNotificationToken.id,
        createOrUpdateInstallation
      );
    }
    return undefined;
  }
  // Check if the notification token is changed from the one registered in the backend
  if (
    storedPushNotificationToken.token ===
    storedPushNotificationToken.registeredToken
  ) {
    void mixpanelTrack("NOTIFICATIONS_INSTALLATION_TOKEN_NOT_CHANGED");
    return undefined;
  }
  // update - send push notification token to the backend
  yield call(
    updateNotificationToken,
    storedPushNotificationToken.token,
    storedPushNotificationToken.id,
    createOrUpdateInstallation
  );
}
