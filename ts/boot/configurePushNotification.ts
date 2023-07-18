/**
 * Set the basic PushNotification configuration
 */
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { constNull, pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { Platform } from "react-native";
import PushNotification from "react-native-push-notification";
import * as pot from "@pagopa/ts-commons/lib/pot";

import {
  maximumItemsFromAPI,
  pageSize,
  remindersOptInEnabled
} from "../config";
import { setMixpanelPushNotificationToken } from "../mixpanel";
import {
  loadPreviousPageMessages,
  reloadAllMessages
} from "../store/actions/messages";
import {
  updateNotificationsInstallationToken,
  updateNotificationsPendingMessage
} from "../store/actions/notifications";
import { getCursors } from "../store/reducers/entities/messages/allPaginated";
import { isDevEnv } from "../utils/environment";
import {
  trackMessageNotificationParsingFailure,
  trackMessageNotificationTap
} from "../features/messages/analytics";
import { store } from "./configureStoreAndPersistor";

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

/**
 * Decide how to refresh the messages based on pagination.
 * It only reloads Inbox since Archive is never changed server-side.
 */
function handleMessageReload() {
  const { inbox: cursors } = getCursors(store.getState());
  if (pot.isNone(cursors)) {
    // nothing in the collection, refresh
    store.dispatch(reloadAllMessages.request({ pageSize, filter: {} }));
  } else if (pot.isSome(cursors)) {
    // something in the collection, get the maximum amount of new ones only,
    // assuming that the message will be there
    store.dispatch(
      loadPreviousPageMessages.request({
        cursor: cursors.value.previous,
        pageSize: maximumItemsFromAPI,
        filter: {}
      })
    );
  }
  // TODO: shall we deep link in foreground?
  // see https://pagopaspa.slack.com/archives/C013V764P9U/p1639558176007600
}

// eslint-disable-next-line sonarjs/cognitive-complexity
function configurePushNotifications() {
  // if isDevEnv is enabled and we are on Android, we need to disable the push notifications to avoid crash for missing firebase settings
  if (isDevEnv && Platform.OS === "android") {
    return;
  }

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
    // Called when token is generated
    onRegister: token => {
      // send token to enable PN through Mixpanel
      setMixpanelPushNotificationToken(token.token).then(constNull, constNull);
      // Dispatch an action to save the token in the store
      store.dispatch(updateNotificationsInstallationToken(token.token));
    },

    // Called when a remote or local notification is opened or received
    onNotification: notification =>
      pipe(
        notification,
        NotificationPayload.decode,
        E.mapLeft(trackMessageNotificationParsingFailure),
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
          pipe(
            trackMessageNotificationTap(messageId),
            () => notification.foreground,
            B.foldW(
              // The App was closed/in background and has been now opened clicking
              // on the push notification.
              // Save the message id of the notification in the store so the App can
              // navigate to the message detail screen as soon as possible (if
              // needed after the user login/insert the unlock code)
              () =>
                store.dispatch(
                  updateNotificationsPendingMessage(messageId, false)
                ),
              // The App is in foreground so just refresh the messages list
              () => handleMessageReload()
            )
          )
        ),
        // On iOS we need to call this when the remote notification handling is complete
        () => notification.finish(PushNotificationIOS.FetchResult.NoData)
      ),
    // Only for iOS, we need to customize push notification prompt.
    // We delay the push notification promt until opt-in screen
    // during onboarding where permission is clearly required
    requestPermissions: !remindersOptInEnabled || Platform.OS !== "ios"
  });
}

export default configurePushNotifications;
