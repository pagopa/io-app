/**
 * Set the basic PushNotification configuration
 */

import { fromEither, fromNullable } from "fp-ts/lib/Option";
import * as t from "io-ts";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { Alert, Platform, PushNotificationIOS } from "react-native";
import PushNotification from "react-native-push-notification";

import { debugRemotePushNotification, gcmSenderId } from "../config";
import { loadMessagesRequest } from "../store/actions/messages";
import {
  updateNotificationsInstallationToken,
  updateNotificationsPendingMessage
} from "../store/actions/notifications";
import { Store } from "../store/actions/types";

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

function configurePushNotifications(store: Store) {
  PushNotification.configure({
    // Called when token is generated
    onRegister: token => {
      // Dispatch an action to save the token in the store
      store.dispatch(updateNotificationsInstallationToken(token.token));
    },

    // Called when a remote or local notification is opened or received
    onNotification: notification => {
      if (debugRemotePushNotification) {
        Alert.alert("Notification", JSON.stringify(notification));
      }

      // we try first to get the messageId from payload.message_id, if that's
      // empty, we fall back to payload.data.message_id - note that both are
      // defined as NonEmptyString(s) so if the decoding succees and either one
      // exists, we're sure it's not an empty string
      const maybeMessageId = fromEither(
        NotificationPayload.decode(notification)
      ).chain(payload =>
        fromNullable(payload.message_id).alt(
          fromNullable(payload.data).mapNullable(_ => _.message_id)
        )
      );

      maybeMessageId.map(messageId => {
        // We just received a push notification about a new message
        if (notification.foreground) {
          // The App is in foreground so just refresh the messages list
          store.dispatch(loadMessagesRequest());
        } else {
          /**
           * The App was closed/in background and has been now opened clicking on the push notification.
           * Save the message id of the notification in the store so the App can navigate to the message detail screen
           * as soon as possible (if needed after the user login/insert the unlock PIN)
           */
          store.dispatch(
            updateNotificationsPendingMessage(
              messageId,
              notification.foreground
            )
          );
        }
      });

      if (Platform.OS === "ios") {
        // On iOS we need to call this when the remote notification handling is complete
        notification.finish(
          maybeMessageId.isSome()
            ? PushNotificationIOS.FetchResult.NewData
            : PushNotificationIOS.FetchResult.NoData
        );
      }
    },

    // GCM Sender ID
    senderID: gcmSenderId
  });
}

export default configurePushNotifications;
