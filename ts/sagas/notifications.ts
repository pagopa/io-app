/**
 * A saga to manage notifications
 */
import { TypeOfApiResponseStatus } from "italia-ts-commons/lib/requests";
import { Platform } from "react-native";
import { call, Effect, put, select } from "redux-saga/effects";

import { readableReport } from "italia-ts-commons/lib/reporters";
import { PlatformEnum } from "../../definitions/backend/Platform";
import { CreateOrUpdateInstallationT } from "../../definitions/backend/requestTypes";
import { BackendClient } from "../api/backend";
import { updateNotificationInstallationFailure } from "../store/actions/notifications";
import { notificationsInstallationSelector } from "../store/reducers/notifications/installation";
import { GlobalState } from "../store/reducers/types";
import { SagaCallReturnType } from "../types/utils";

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
): Iterator<
  Effect | TypeOfApiResponseStatus<CreateOrUpdateInstallationT> | undefined
> {
  // Get the notifications installation data from the store
  const notificationsInstallation: ReturnType<
    typeof notificationsInstallationSelector
  > = yield select<GlobalState>(notificationsInstallationSelector);

  // Check if the notification server token is available (non available on iOS simulator)
  if (notificationsInstallation.token === undefined) {
    return undefined;
  }
  try {
    // Send the request to the backend
    const response: SagaCallReturnType<
      typeof createOrUpdateInstallation
    > = yield call(createOrUpdateInstallation, {
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
    return response.value.status;
  } catch (error) {
    yield put(updateNotificationInstallationFailure(error));
    return undefined;
  }
}
