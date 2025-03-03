import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { captureMessage } from "@sentry/react-native";
import { constNull, pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { Platform } from "react-native";
import PushNotification, {
  ReceivedNotification
} from "react-native-push-notification";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { maximumItemsFromAPI, pageSize } from "../../../config";
import {
  loadPreviousPageMessages,
  reloadAllMessages
} from "../../messages/store/actions";
import {
  trackMessageNotificationParsingFailure,
  trackMessageNotificationTap
} from "../../messages/analytics";
import { store } from "../../../boot/configureStoreAndPersistor";
import { newPushNotificationsToken } from "../store/actions/installation";
import { updateNotificationsPendingMessage } from "../store/actions/pendingMessage";
import { isLoadingOrUpdating } from "../../../utils/pot";
import { isArchivingInProcessingModeSelector } from "../../messages/store/reducers/archiving";
import { GlobalState } from "../../../store/reducers/types";
import { trackNewPushNotificationsTokenGenerated } from "../analytics";
import { isTestEnv } from "../../../utils/environment";

export const configurePushNotifications = () => {
  // Create the default channel used for notifications, the callback return false if the channel already exists
  PushNotification.createChannel(
    {
      channelId: "io_default_notification_channel",
      channelName: "IO default notification channel",
      playSound: true,
      soundName: "default",
      importance: 4,
      vibrate: true
    },
    constNull
  );
  PushNotification.configure({
    onRegister: onPushNotificationTokenAvailable,
    onNotification: onPushNotificationReceived,
    // Only for iOS, we need to customize push notification prompt.
    // We delay the push notification promt until opt-in screen
    // during onboarding where permission is clearly required
    requestPermissions: Platform.OS !== "ios"
  });
};

const onPushNotificationTokenAvailable = (token: {
  os: string;
  token: string;
}) => {
  if (token == null || token.token == null) {
    captureMessage(
      `onPushNotificationTokenAvailable received a nullish token (or inner 'token' instance) (${token})`
    );
    return;
  }
  // Dispatch an action to save the token in the store
  store.dispatch(newPushNotificationsToken(token.token));
  trackNewPushNotificationsTokenGenerated();
};

/**
 * Helper type used to validate the notification payload.
 * The message_id can be in different places depending on the platform.
 */
const NotificationPayload = t.partial({
  message_id: NonEmptyString,
  data: t.partial({
    message_id: NonEmptyString
  })
});

const onPushNotificationReceived = (
  notification: Omit<ReceivedNotification, "userInfo">
) =>
  pipe(
    notification.userInteraction,
    B.fold(
      () => E.left(undefined),
      () =>
        pipe(
          notification,
          NotificationPayload.decode,
          E.mapLeft(trackMessageNotificationParsingFailure)
        )
    ),
    O.fromEither,
    O.chain(payload =>
      pipe(
        payload.message_id,
        O.fromNullable,
        O.alt(() =>
          pipe(
            payload.data,
            O.fromNullable,
            O.chainNullableK(_ => _.message_id)
          )
        )
      )
    ),
    // We just received a push notification about a new message
    O.map(messageId =>
      pipe(trackMessageNotificationTap(messageId), trackingResult =>
        pipe(
          notification.foreground,
          B.foldW(
            // The App was closed/in background and has been now opened clicking
            // on the push notification.
            // Save the message id of the notification in the store so the App can
            // navigate to the message detail screen as soon as possible (if
            // needed after the user login/insert the unlock code)
            () =>
              store.dispatch(
                updateNotificationsPendingMessage({
                  id: messageId,
                  foreground: false,
                  trackEvent: trackingResult === undefined
                })
              ),
            // The App is in foreground so just refresh the messages list
            () => handleForegroundMessageReload()
          )
        )
      )
    ),
    // On iOS we need to call this when the remote notification handling is complete
    () => notification.finish(PushNotificationIOS.FetchResult.NoData)
  );

/**
 * Decide how to refresh the messages based on pagination.
 * It only reloads Inbox since Archive is never changed server-side.
 */
const handleForegroundMessageReload = () => {
  const state = store.getState();
  // Make sure there are not progressing message loadings and
  // that the system is not processing any message archiving/restoring
  const allPaginated = state.entities.messages.allPaginated;
  const isProcessingArchivingOrRestoring =
    isArchivingInProcessingModeSelector(state);
  if (
    isLoadingOrUpdating(allPaginated.archive.data) ||
    isLoadingOrUpdating(allPaginated.inbox.data) ||
    isProcessingArchivingOrRestoring
  ) {
    return;
  }

  const { inbox: inboxIndexes } =
    getArchiveAndInboxNextAndPreviousPageIndexes(state);
  if (pot.isNone(inboxIndexes)) {
    // nothing in the collection, refresh
    store.dispatch(
      reloadAllMessages.request({ pageSize, filter: {}, fromUserAction: false })
    );
  } else if (pot.isSome(inboxIndexes)) {
    // something in the collection, get the maximum amount of new ones only,
    // assuming that the message will be there
    store.dispatch(
      loadPreviousPageMessages.request({
        cursor: inboxIndexes.value.previous,
        pageSize: maximumItemsFromAPI,
        filter: {},
        fromUserAction: false
      })
    );
  }
};

const getArchiveAndInboxNextAndPreviousPageIndexes = (state: GlobalState) =>
  pipe(state.entities.messages.allPaginated, ({ archive, inbox }) => ({
    archive: pot.map(archive.data, ({ previous, next }) => ({
      previous,
      next
    })),
    inbox: pot.map(inbox.data, ({ previous, next }) => ({ previous, next }))
  }));

export const testable = isTestEnv
  ? {
      getArchiveAndInboxNextAndPreviousPageIndexes,
      handleForegroundMessageReload,
      onPushNotificationReceived,
      onPushNotificationTokenAvailable
    }
  : undefined;
