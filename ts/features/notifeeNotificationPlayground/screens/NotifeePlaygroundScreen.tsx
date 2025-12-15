import {
  Banner,
  ContentWrapper,
  IOButton,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Alert } from "react-native";
import {
  scheduleNotification,
  getScheduledNotifications,
  cancelAllScheduledNotifications
} from "../utils/notifeeUtils";

export const NotifeePlaygroundScreen = () => {
  const handleScheduleNotification = async () => {
    try {
      const notificationId = await scheduleNotification(
        5, // 5 minutes delay
        "IO App Playground",
        "Scheduled Notification - This is a test notification from Notifee Playground."
      );

      Alert.alert(
        "Notification scheduled!",
        `The notification will be shown in 5 minutes.\nID: ${notificationId}`,
        [{ text: "OK" }]
      );
    } catch (error) {
      // Log error for debugging
      Alert.alert(
        "Error",
        "Could not schedule notification. Check permissions.",
        [{ text: "OK" }]
      );
    }
  };

  const handleShowScheduledNotifications = async () => {
    try {
      const scheduledNotifications = await getScheduledNotifications();

      if (scheduledNotifications.length === 0) {
        Alert.alert(
          "No scheduled notifications",
          "There are no scheduled notifications at the moment.",
          [{ text: "OK" }]
        );
      } else {
        const notificationsList = scheduledNotifications
          .map(
            (notif, index) =>
              `${index + 1}. ${notif.notification.title || "No title"}`
          )
          .join("\n");

        Alert.alert(
          "Scheduled notifications",
          `You have ${scheduledNotifications.length} scheduled notification(s):\n\n${notificationsList}`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Could not retrieve scheduled notifications.", [
        { text: "OK" }
      ]);
    }
  };

  const handleCancelAllNotifications = async () => {
    try {
      await cancelAllScheduledNotifications();
      Alert.alert(
        "Notifications cancelled",
        "All scheduled notifications have been cancelled.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Could not cancel notifications.", [{ text: "OK" }]);
    }
  };

  return (
    <ContentWrapper>
      <Banner
        title="Notifee Playground"
        color="neutral"
        pictogramName="notification"
      />
      <VSpacer size={24} />
      <IOButton
        label="Schedule notification on 5 minutes"
        onPress={handleScheduleNotification}
        variant="solid"
        color="primary"
      />
      <VSpacer size={16} />
      <IOButton
        label="Show scheduled notifications"
        onPress={handleShowScheduledNotifications}
        variant="outline"
        color="primary"
      />
      <VSpacer size={16} />
      <IOButton
        label="Cancel all notifications"
        onPress={handleCancelAllNotifications}
        variant="outline"
        color="danger"
      />
    </ContentWrapper>
  );
};
