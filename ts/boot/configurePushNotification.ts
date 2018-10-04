/**
 * Set the basic PushNotification configuration
 */

import { Alert, PushNotificationIOS } from "react-native";
import PushNotification from "react-native-push-notification";

import { debugRemotePushNotification, gcmSenderId } from "../config";
import { loadMessagesRequest } from "../store/actions/messages";
import {
  updateNotificationsInstallationToken,
  updateNotificationsPendingMessage
} from "../store/actions/notifications";
import { Store } from "../store/actions/types";

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

      if (notification.message_id) {
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
              notification.message_id,
              notification.foreground
            )
          );
        }
      }

      // On iOS we need to call this when the remote notification handling is complete
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    // GCM Sender ID
    senderID: gcmSenderId
  });
}

export default configurePushNotifications;
