import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { Platform } from "react-native";
import { SagaIterator } from "redux-saga";
import { call, put, select, take } from "typed-redux-saga/macro";
import { PlatformEnum } from "../../../../definitions/backend/Platform";
import { BackendClient } from "../../../api/backend";
import { notificationsInstallationSelector } from "../store/reducers/installation";
import { convertUnknownToError } from "../../../utils/errors";
import {
  trackNotificationInstallationTokenNotChanged,
  trackPushNotificationTokenUploadFailure,
  trackPushNotificationTokenUploadSucceeded
} from "../analytics";
import {
  newPushNotificationsToken,
  pushNotificationsTokenUploaded
} from "../store/actions/installation";

export const notificationsPlatform: PlatformEnum =
  Platform.select<PlatformEnum>({
    ios: PlatformEnum.apns,
    android: PlatformEnum.gcm,
    default: PlatformEnum.gcm
  });

export function* pushNotificationTokenUpload(
  createOrUpdateInstallation: ReturnType<
    typeof BackendClient
  >["createOrUpdateInstallation"]
): SagaIterator {
  // Await for a notification token, since it may not
  // be available yet when this function is caled
  const notificationsInstallation = yield* call(awaitForPushNotificationToken);
  // Check if the notification token has changed
  // from the one registered in the backend
  if (
    notificationsInstallation.token ===
    notificationsInstallation.registeredToken
  ) {
    yield* call(trackNotificationInstallationTokenNotChanged);
    return;
  }
  try {
    // Send the token to the backend
    const response = yield* call(createOrUpdateInstallation, {
      installationID: notificationsInstallation.id,
      body: {
        platform: notificationsPlatform,
        pushChannel: notificationsInstallation.token
      }
    });
    // Decoding failure
    if (E.isLeft(response)) {
      yield* call(
        trackPushNotificationTokenUploadFailure,
        readableReport(response.left)
      );
      return;
    }
    // Unexpected response code
    if (response.right.status !== 200) {
      yield* call(
        trackPushNotificationTokenUploadFailure,
        `response status code ${response.right.status}`
      );
      return;
    }

    // Success
    yield* put(pushNotificationsTokenUploaded(notificationsInstallation.token));
    yield* call(trackPushNotificationTokenUploadSucceeded);
  } catch (e) {
    // Unknwon error
    yield* call(
      trackPushNotificationTokenUploadFailure,
      `${convertUnknownToError(e)}`
    );
  }
}

export function* awaitForPushNotificationToken() {
  // When this function is called, the push notification token may
  // not be available yet. In such case, the code will wait for
  // 'newPushNotificationsToken' action, which is dispatched as
  // soon as the token becomes available. A do-while loop is used
  // to be extra sure that the token has been stored inside redux
  do {
    const notificationsInstallation = yield* select(
      notificationsInstallationSelector
    );
    if (notificationsInstallation.token) {
      // The output object is re-created in order
      // to have a non-optional 'token' instance
      return {
        ...notificationsInstallation,
        token: notificationsInstallation.token
      };
    }
    yield* take(newPushNotificationsToken);
  } while (true);
}
