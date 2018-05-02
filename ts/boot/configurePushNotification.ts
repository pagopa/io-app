import { PushNotificationIOS } from "react-native";
import PushNotification from "react-native-push-notification";

function configurePushNotifications() {
  PushNotification.configure({
    onRegister: function(token) {
      console.log("TOKEN:", token);
    },

    onNotification: function(notification) {
      console.log("NOTIFICATION:", notification);

      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    senderID: "317157111831"
  });

  PushNotification.localNotificationSchedule({
    id: "0",
    title: "A test local scheduled notification",
    message: "I am the message of the push notification",
    date: new Date(Date.now() + 60 * 1000)
  });
}

export default configurePushNotifications;
