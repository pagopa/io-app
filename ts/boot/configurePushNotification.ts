/**
 * Set the basic PushNotification configuration
 */

import { Alert, PushNotificationIOS } from "react-native";
import PushNotification from "react-native-push-notification";

import { debugRemotePushNotification, gcmSenderId } from "../config";
import { updateNotificationsInstallationToken } from "../store/actions/notifications";
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

      // On iOS we need to call this when the remote notification handling is complete
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    // GCM Sender ID
    senderID: gcmSenderId
  });
}

export default configurePushNotifications;
