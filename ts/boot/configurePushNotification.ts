/**
 * Set the basic PushNotification configuration
 */

import { Alert, PushNotificationIOS } from "react-native";
import PushNotification from "react-native-push-notification";
import { debugRemotePushNotification } from "../config";

function configurePushNotifications() {
  PushNotification.configure({

    // Called when a remote or local notification is opened or received
    onNotification: notification => {
      if (debugRemotePushNotification) {
        Alert.alert("Notification", JSON.stringify(notification));
      }

      // On iOS we need to call this when the remote notification handling is complete
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    // GCM Sender ID
    senderID: "317157111831"
  });
}

export default configurePushNotifications;
