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
        10, // 10 minutes delay
        "IO App Playground",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      );

      Alert.alert(
        "Notifica schedulata!",
        `La notifica verrà mostrata tra 10 minuti.\nID: ${notificationId}`,
        [{ text: "OK" }]
      );
    } catch (error) {
      // Log error for debugging
      Alert.alert(
        "Errore",
        "Non è stato possibile schedulare la notifica. Controlla i permessi.",
        [{ text: "OK" }]
      );
    }
  };

  const handleShowScheduledNotifications = async () => {
    try {
      const scheduledNotifications = await getScheduledNotifications();

      if (scheduledNotifications.length === 0) {
        Alert.alert(
          "Nessuna notifica schedulata",
          "Non ci sono notifiche programmate al momento.",
          [{ text: "OK" }]
        );
      } else {
        const notificationsList = scheduledNotifications
          .map(
            (notif, index) =>
              `${index + 1}. ${notif.notification.title || "Senza titolo"}`
          )
          .join("\n");

        Alert.alert(
          "Notifiche schedulate",
          `Hai ${scheduledNotifications.length} notifica/e programmate:\n\n${notificationsList}`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert(
        "Errore",
        "Non è stato possibile recuperare le notifiche schedulate.",
        [{ text: "OK" }]
      );
    }
  };

  const handleCancelAllNotifications = async () => {
    try {
      await cancelAllScheduledNotifications();
      Alert.alert(
        "Notifiche cancellate",
        "Tutte le notifiche schedulate sono state cancellate.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Errore", "Non è stato possibile cancellare le notifiche.", [
        { text: "OK" }
      ]);
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
        label="Schedule notification on 10 minutes"
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
