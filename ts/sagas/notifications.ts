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
import { RTron } from "../boot/configureStoreAndPersistor";

const notificationsPlatform: PlatformEnum = Platform.select<PlatformEnum>({
  ios: PlatformEnum.apns,
  android: PlatformEnum.gcm,
  default: PlatformEnum.gcm
});

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
 * This generator function calls the ProxyApi `installation` endpoint
 */
export function* updateInstallationSaga(
  createOrUpdateInstallation: ReturnType<
    typeof BackendClient
  >["createOrUpdateInstallation"]
): SagaIterator {
  const storedPushNotificationToken: ReturnType<
    typeof notificationsInstallationSelector
  > = yield select(notificationsInstallationSelector);
  RTron.log("storedPushNotificationToken", storedPushNotificationToken);
  // Check if the there is push notification token
  if (storedPushNotificationToken.token === undefined) {
    // retrieve a push notification token from Firebase/APNS
    const pushNotificationToken: SagaCallReturnType<
      typeof configurePushNotification
    > = yield call(configurePushNotification);
    RTron.log("pushNotificationToken", pushNotificationToken);
    // undefined -> dev env
    if (pushNotificationToken !== undefined) {
      RTron.log("send", pushNotificationToken);
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
    RTron?.log("same");
    void mixpanelTrack("NOTIFICATIONS_INSTALLATION_TOKEN_NOT_CHANGED");
    return undefined;
  }
  RTron.log("update", storedPushNotificationToken.token);
  // update - send push notification token to the backend
  yield call(
    updateNotificationToken,
    storedPushNotificationToken.token,
    storedPushNotificationToken.id,
    createOrUpdateInstallation
  );
}
