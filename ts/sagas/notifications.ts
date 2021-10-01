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
import { notificationsInstallationSelector } from "../store/reducers/notifications/installation";
import { SagaCallReturnType } from "../types/utils";
import { mixpanelTrack } from "../mixpanel";

const notificationsPlatform: PlatformEnum = Platform.select<PlatformEnum>({
  ios: PlatformEnum.apns,
  android: PlatformEnum.gcm,
  default: PlatformEnum.gcm
});

/**
 * This generator function calls the ProxyApi `installation` endpoint
 */
export function* updateInstallationSaga(
  createOrUpdateInstallation: ReturnType<
    typeof BackendClient
  >["createOrUpdateInstallation"]
): SagaIterator {
  // Get the notifications installation data from the store
  const notificationsInstallation: ReturnType<
    typeof notificationsInstallationSelector
  > = yield select(notificationsInstallationSelector);
  // Check if the notification server token is available (non available on iOS simulator)
  if (notificationsInstallation.token === undefined) {
    return undefined;
  }
  // Check if the notification token is changed from the one registered in the backend
  if (
    notificationsInstallation.token ===
    notificationsInstallation.registeredToken
  ) {
    void mixpanelTrack("NOTIFICATIONS_INSTALLATION_TOKEN_NOT_CHANGED");
    return undefined;
  }
  try {
    // Send the request to the backend
    const response: SagaCallReturnType<typeof createOrUpdateInstallation> =
      yield call(createOrUpdateInstallation, {
        installationID: notificationsInstallation.id,
        installation: {
          platform: notificationsPlatform,
          pushChannel: notificationsInstallation.token
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
        notificationsInstallationTokenRegistered(
          notificationsInstallation.token
        )
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
