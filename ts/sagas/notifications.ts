/**
 * A saga to manage notifications
 */
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { identity, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { Platform } from "react-native";
import { SagaIterator } from "redux-saga";
import { call, put, select } from "typed-redux-saga/macro";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { PlatformEnum } from "../../definitions/backend/Platform";
import { BackendClient } from "../api/backend";
import {
  clearNotificationPendingMessage,
  notificationsInstallationTokenRegistered,
  updateNotificationInstallationFailure
} from "../store/actions/notifications";
import { notificationsInstallationSelector } from "../store/reducers/notifications/installation";
import { SagaCallReturnType } from "../types/utils";
import { convertUnknownToError } from "../utils/errors";
import { trackNotificationInstallationTokenNotChanged } from "../utils/analytics";
import {
  PendingMessageState,
  pendingMessageStateSelector
} from "../store/reducers/notifications/pendingMessage";
import { isPaymentOngoingSelector } from "../store/reducers/wallet/payment";
import { navigateToMainNavigatorAction } from "../store/actions/navigation";
import { navigateToMessageRouterAction } from "../features/messages/store/actions/navigation";
import NavigationService from "../navigation/NavigationService";
import { UIMessageId } from "../features/messages/types";
import { trackMessageNotificationTap } from "../features/messages/analytics";

export const notificationsPlatform: PlatformEnum =
  Platform.select<PlatformEnum>({
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
  > = yield* select(notificationsInstallationSelector);
  // Check if the notification server token is available (non available on iOS simulator)
  if (notificationsInstallation.token === undefined) {
    return undefined;
  }
  // Check if the notification token is changed from the one registered in the backend
  if (
    notificationsInstallation.token ===
    notificationsInstallation.registeredToken
  ) {
    trackNotificationInstallationTokenNotChanged();
    return undefined;
  }
  try {
    // Send the request to the backend
    const response: SagaCallReturnType<typeof createOrUpdateInstallation> =
      yield* call(createOrUpdateInstallation, {
        installationID: notificationsInstallation.id,
        body: {
          platform: notificationsPlatform,
          pushChannel: notificationsInstallation.token
        }
      });
    /**
     * If the response isLeft (got an error) dispatch a failure action
     */
    if (E.isLeft(response)) {
      throw Error(readableReport(response.left));
    }
    if (response.right.status === 200) {
      yield* put(
        notificationsInstallationTokenRegistered(
          notificationsInstallation.token
        )
      );
    } else {
      yield* put(
        updateNotificationInstallationFailure(
          new Error(`response status code ${response.right.status}`)
        )
      );
    }
  } catch (e) {
    yield* put(updateNotificationInstallationFailure(convertUnknownToError(e)));
  }
}

export function* handlePendingMessageStateIfAllowedSaga(
  shouldResetToMainNavigator: boolean = false
) {
  // Check if we have a pending notification message
  const pendingMessageState: ReturnType<typeof pendingMessageStateSelector> =
    yield* select(pendingMessageStateSelector);
  // It may be needed to track the push notification tap event (since mixpanel
  // was not initialized at the moment where the notification came - e.g., when
  // the application was killed and the push notification is tapped)
  yield* call(trackMessageNotificationTapIfNeeded, pendingMessageState);

  // Check if there is a payment ongoing
  const isPaymentOngoing: ReturnType<typeof isPaymentOngoingSelector> =
    yield* select(isPaymentOngoingSelector);

  if (!isPaymentOngoing && pendingMessageState) {
    // We have a pending notification message to handle
    const messageId = pendingMessageState.id;

    // Remove the pending message from the notification state
    yield* put(clearNotificationPendingMessage());

    if (shouldResetToMainNavigator) {
      yield* call(navigateToMainNavigatorAction);
    }

    // Navigate to message router screen
    yield* call(
      NavigationService.dispatchNavigationAction,
      navigateToMessageRouterAction({
        messageId: messageId as UIMessageId,
        fromNotification: true
      })
    );
  }
}

export function trackMessageNotificationTapIfNeeded(
  pendingMessageStateOpt?: PendingMessageState
) {
  pipe(
    pendingMessageStateOpt,
    O.fromNullable,
    O.chain(pendingMessageState =>
      pipe(
        pendingMessageState.trackEvent,
        O.fromNullable,
        O.filter(identity),
        O.map(_ =>
          trackMessageNotificationTap(pendingMessageState.id as NonEmptyString)
        )
      )
    )
  );
}
