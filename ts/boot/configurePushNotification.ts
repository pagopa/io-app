/**
 * Set the basic PushNotification configuration
 */
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { constNull } from "fp-ts/lib/function";
import { fromEither, fromNullable } from "fp-ts/lib/Option";
import * as t from "io-ts";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { Alert, Platform } from "react-native";
import PushNotification from "react-native-push-notification";
import * as pot from "@pagopa/ts-commons/lib/pot";

import {
  debugRemotePushNotification,
  maximumItemsFromAPI,
  pageSize,
  usePaginatedMessages
} from "../config";
import { mixpanelTrack, setMixpanelPushNotificationToken } from "../mixpanel";
import {
  DEPRECATED_loadMessages,
  loadPreviousPageMessages,
  reloadAllMessages
} from "../store/actions/messages";
import {
  updateNotificationsInstallationToken,
  updateNotificationsPendingMessage
} from "../store/actions/notifications";
import { getCursors } from "../store/reducers/entities/messages/allPaginated";
import { isDevEnv } from "../utils/environment";
import { readablePrivacyReport } from "../utils/reporters";
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
  // if isDevEnv is enabled and we are on Android, we need to disable the push notification to avoid crash for missing firebase settings
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
    onNotification: notification => {
      if (debugRemotePushNotification) {
        Alert.alert("Notification", JSON.stringify(notification));
      }

      const maybeMessageId = fromEither(
        NotificationPayload.decode(notification).mapLeft(errors => {
          void mixpanelTrack("NOTIFICATION_PARSING_FAILURE", {
            reason: readablePrivacyReport(errors)
          });
        })
      ).chain(payload =>
        fromNullable(payload.message_id).alt(
          fromNullable(payload.data).mapNullable(_ => _.message_id)
        )
      );

      maybeMessageId.map(messageId => {
        // We just received a push notification about a new message
        if (notification.foreground) {
          // The App is in foreground so just refresh the messages list
          if (usePaginatedMessages) {
            handleMessageReload();
          } else {
            store.dispatch(DEPRECATED_loadMessages.request());
          }
        } else {
          // The App was closed/in background and has been now opened clicking
          // on the push notification.
          // Save the message id of the notification in the store so the App can
          // navigate to the message detail screen as soon as possible (if
          // needed after the user login/insert the unlock code)
          store.dispatch(updateNotificationsPendingMessage(messageId, false));

          if (!usePaginatedMessages) {
            // finally, refresh the message list to start loading the content of
            // the new message - only needed for legacy system
            store.dispatch(DEPRECATED_loadMessages.request());
          }
        }
      });

      // On iOS we need to call this when the remote notification handling is complete
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    }
  });
}

export default configurePushNotifications;
