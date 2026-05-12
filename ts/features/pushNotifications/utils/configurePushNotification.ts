import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { updateMixpanelProfileProperties } from "../../../mixpanelConfig/profileProperties";
import { Store } from "../../../store/actions/types";
import { isMixpanelEnabled } from "../../../store/reducers/persistedPreferences";
import { GlobalState } from "../../../store/reducers/types";
import { trackAppCaughtError } from "../../../utils/analytics";
import { isTestEnv } from "../../../utils/environment";
import { trackNewPushNotificationsTokenGenerated } from "../analytics";
import { newPushNotificationsToken } from "../store/actions/installation";
import { handleMessageNotificationInteraction } from "./pushNotificationHandlers";

const unhandledForegroundNotificationIds = new Set<string>();
/**
 * Registers listeners for push notifications and push token updates,
 * handles any pending notification response from a cold start,
 * and fetches the device push token.
 * @param store the redux store, needed to dispatch actions from the notification listeners
 * @returns a function to remove the registered listeners
 */
export const configurePushNotificationListeners = (store: Store) => {
  handleColdStartNotification(store);

  const tokenSubscription = Notifications.addPushTokenListener(
    onPushNotificationTokenReceived(store)
  );

  const notificationReceivedSubscription =
    Notifications.addNotificationReceivedListener(event =>
      unhandledForegroundNotificationIds.add(event.request.identifier)
    );

  const notificationResponseSubscription =
    Notifications.addNotificationResponseReceivedListener(response => {
      const { identifier } = response.notification.request;
      const isForegroundNotification =
        unhandledForegroundNotificationIds.delete(identifier); // returns true on successful delete
      onNotificationResponse(response, isForegroundNotification, store);
    });
  void Notifications.getDevicePushTokenAsync();

  return () =>
    removePushNotificationListeners([
      tokenSubscription,
      notificationReceivedSubscription,
      notificationResponseSubscription
    ]);
};

export const initializePushNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false
    })
  });
};

export const setupAndroidNotificationChannel = async (): Promise<void> => {
  if (Platform.OS !== "android") {
    return;
  }
  await Notifications.setNotificationChannelAsync(
    "io_default_notification_channel",
    {
      name: "IO default notification channel",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: "default"
    }
  );
};

// ----------------------  HANDLERS ----------------------

const handleColdStartNotification = (store: Store) => {
  const lastResponse = Notifications.getLastNotificationResponse();
  if (!lastResponse) {
    return;
  }
  onNotificationResponse(lastResponse, false, store);
};

const onNotificationResponse = (
  response: Notifications.NotificationResponse,
  receivedInForeground: boolean,
  store: Store
) => {
  const { identifier } = response.notification.request;
  if (identifier == null) {
    // safeguard against ghost intent notifications sent by certain android OSes
    return;
  }
  // in order to avoid handling the same notification multiple times,
  // it is crucial that we clear the persisted last notification response as soon as possible
  Notifications.clearLastNotificationResponse();

  handleMessageNotificationInteraction(
    response,
    receivedInForeground,
    store,
    hasUserOptedInForAnalytics(store.getState())
  );

  void Notifications.dismissNotificationAsync(identifier);
};
const onPushNotificationTokenReceived =
  (store: Store) => (token: { data?: string | null }) => {
    if (!token.data) {
      trackAppCaughtError(
        "onPushNotificationTokenAvailable",
        `received a nullish token data (${token.data})`,
        undefined
      );
      return;
    }
    store.dispatch(newPushNotificationsToken(token.data));
    const userOptedInForAnalytics = hasUserOptedInForAnalytics(
      store.getState()
    );
    trackNewPushNotificationsTokenGenerated(
      Date.now().toString(),
      userOptedInForAnalytics
    );
    void updateMixpanelProfileProperties(store.getState());
  };

// ---------------------- UTILS ----------------------

const hasUserOptedInForAnalytics = (state: GlobalState) =>
  isMixpanelEnabled(state) ?? false;

const removePushNotificationListeners = (
  subscriptions: Array<Notifications.EventSubscription>
) => {
  subscriptions.forEach(s => s.remove());
};

export const testable = isTestEnv
  ? {
      unhandledForegroundNotificationIds,
      handleColdStartNotification,
      onNotificationResponse,
      onPushNotificationTokenReceived,
      hasUserOptedInForAnalytics
    }
  : undefined;
