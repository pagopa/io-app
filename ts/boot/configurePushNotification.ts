/**
 * Set the basic PushNotification configuration
 */

import { Alert, PushNotificationIOS } from "react-native";
import PushNotification from "react-native-push-notification";
import { debugRemotePushNotification, gcmSenderId } from "../config";
import { Store } from "../actions/types";
import { updateNotificationsToken } from "../store/actions/notifications";

function configurePushNotifications(store: Store) {
  PushNotification.configure({
    onRegister: token => {
      store.dispatch(updateNotificationsToken(token.token));
    },

    // Called when a remote or local notification is opened or received
    onNotification: notification => {
      if (debugRemotePushNotification) {
        Alert.alert("Notification", JSON.stringify(notification));
      }

      // On iOS we need to call this when the remote notification handling is complete
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    // GCM Sender ID
    senderID: gcmSenderId
  });
}

export default configurePushNotifications;
