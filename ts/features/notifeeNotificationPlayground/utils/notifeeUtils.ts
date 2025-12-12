import notifee, { TriggerType, AndroidImportance } from "@notifee/react-native";

/**
 * Schedules a notification after a specified delay using Notifee
 * @param delayInMinutes - Number of minutes to delay the notification
 * @param title - Notification title
 * @param body - Notification body
 * @returns Promise<string> - Returns the notification ID
 */
export const scheduleNotification = async (
  delayInMinutes: number,
  title: string,
  body: string
): Promise<string> => {
  // Request permission (important for iOS)
  await notifee.requestPermission();

  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: "io-playground",
    name: "IO Playground Notifications",
    importance: AndroidImportance.HIGH
  });

  // Calculate the trigger time
  const triggerDate = new Date();
  triggerDate.setMinutes(triggerDate.getMinutes() + delayInMinutes);

  // Create the notification
  return await notifee.createTriggerNotification(
    {
      id: `playground-${Date.now()}`,
      title,
      body,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        autoCancel: true
      },
      ios: {
        sound: "default"
      }
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerDate.getTime()
    }
  );
};

/**
 * Cancels all scheduled notifications
 */
export const cancelAllScheduledNotifications = async (): Promise<void> => {
  await notifee.cancelAllNotifications();
};

/**
 * Gets all scheduled notifications
 */
export const getScheduledNotifications = async () =>
  await notifee.getTriggerNotifications();
