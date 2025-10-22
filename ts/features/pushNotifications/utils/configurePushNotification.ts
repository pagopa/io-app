import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { captureMessage } from "@sentry/react-native";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { Platform } from "react-native";
import PushNotification, {
  ReceivedNotification
} from "react-native-push-notification";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { maximumItemsFromAPI, pageSize } from "../../../config";
import {
  loadPreviousPageMessages,
  reloadAllMessages
} from "../../messages/store/actions";
import {
  trackMessageNotificationParsingFailure,
  trackMessageNotificationTap
} from "../../messages/analytics";
import { newPushNotificationsToken } from "../store/actions/installation";
import { updateNotificationsPendingMessage } from "../store/actions/pendingMessage";
import { isLoadingOrUpdating } from "../../../utils/pot";
import { isArchivingInProcessingModeSelector } from "../../messages/store/reducers/archiving";
import { GlobalState } from "../../../store/reducers/types";
import { trackNewPushNotificationsTokenGenerated } from "../analytics";
import { isTestEnv } from "../../../utils/environment";
import { updateMixpanelProfileProperties } from "../../../mixpanelConfig/profileProperties";
import { Store } from "../../../store/actions/types";
import { isMixpanelEnabled } from "../../../store/reducers/persistedPreferences";
import { openWebUrl } from "../../../utils/url.ts";

/**
 * Helper type used to validate the notification payload.
 * The message_id and the deepLink can be in different places depending on the platform.
 */
export const NotificationPayload = t.partial({
  message_id: NonEmptyString,
  deepLink: NonEmptyString,
  data: t.partial({
    message_id: NonEmptyString,
    deepLink: NonEmptyString
  })
});

type ParsedNotificationPayload = {
  messageId?: string;
  deepLink?: string;
};

export const configurePushNotifications = (store: Store) => {
  // Create the default channel used for notifications, the callback return false if the channel already exists
  PushNotification.createChannel(
    {
      channelId: "io_default_notification_channel",
      channelName: "IO default notification channel",
      playSound: true,
      soundName: "default",
      importance: 4,
      vibrate: true
    },
    _created => null
  );
  PushNotification.configure({
    onRegister: token => onPushNotificationTokenAvailable(store, token),
    onNotification: notification =>
      onPushNotificationReceived(notification, store),
    // Only for iOS, we need to customize push notification prompt.
    // We delay the push notification promt until opt-in screen
    // during onboarding where permission is clearly required
    requestPermissions: Platform.OS !== "ios"
  });
};

const onPushNotificationTokenAvailable = (
  store: Store,
  token: {
    os: string;
    token: string;
  }
) => {
  if (token == null || token.token == null) {
    captureMessage(
      `onPushNotificationTokenAvailable received a nullish token (or inner 'token' instance) (${token})`
    );
    return;
  }
  // Dispatch an action to save the token in the store
  store.dispatch(newPushNotificationsToken(token.token));

  const userOptedInForAnalytics = hasUserOptedInForAnalytics(store.getState());
  handleTrackingOfTokenGeneration(userOptedInForAnalytics);

  const state = store.getState();
  void updateMixpanelProfileProperties(state);
};

const onPushNotificationReceived = (
  notification: Omit<ReceivedNotification, "userInfo">,
  store: Store
) => {
  const userOptedInForAnalytics = hasUserOptedInForAnalytics(store.getState());
  if (notification.userInteraction) {
    const parsedPayload = parseNotificationPayload(
      notification,
      userOptedInForAnalytics
    );

    // If the payload is not valid, we stop here
    if (!parsedPayload) {
      return;
    }
    // The payload is valid, handle the notification tap
    const { messageId, deepLink } = parsedPayload;
    // Notification with a message id
    if (messageId != null) {
      handleMessagePushNotification(
        notification.foreground,
        messageId,
        store,
        userOptedInForAnalytics
      );
    } else if (deepLink) {
      // Any other notification with a deep link
      openWebUrl(deepLink);
    }
  }

  // Signal the system that the notification has been processed (this
  // is mandatory even if there was an error. Failing to do so can
  // lead the system to not deliver push notifications anymore)
  notification.finish(PushNotificationIOS.FetchResult.NoData);
};

const parseNotificationPayload = (
  notification: Omit<ReceivedNotification, "userInfo">,
  userAnalyticsOptIn: boolean
): ParsedNotificationPayload | undefined => {
  // Try to decode the notification's payload
  const payloadDecodeEither = NotificationPayload.decode(notification);
  if (E.isLeft(payloadDecodeEither)) {
    // The notification payload is not valid, we need to track the error
    handleTrackingOfDecodingFailure(
      readableReport(payloadDecodeEither.left),
      userAnalyticsOptIn
    );
    return undefined;
  }
  const payload = payloadDecodeEither.right;

  // Push notification payload is different between iOS and Android but
  // we don't use Platform.OS and check for a specific path. Instead,
  // we use a fallback mechanism if the first check fails. In this way,
  // the backend implementation can be fixed in the future without
  // having to also update and upgrade the global minimum app-version.

  // On iOS, params are stored in the top-level payload
  // On Android, params are stored in the payload.data property
  const messageId = payload.message_id ?? payload.data?.message_id;
  // Extract navigation data if present in the payload
  const deepLink = payload.deepLink ?? payload.data?.deepLink;
  // If there is no message_id and no navigationData, we track the error
  if (messageId == null && deepLink == null) {
    handleTrackingOfDecodingFailure(
      "No 'messageId' found in push notification payload data",
      userAnalyticsOptIn
    );
    return undefined;
  }

  return {
    messageId,
    deepLink
  };
};

const handleMessagePushNotification = (
  receivedInForeground: boolean,
  messageId: string,
  store: Store,
  userAnalyticsOptIn: boolean
) => {
  // This kind of tracking either tracks the event directly
  // or it enqueues it for a later mixpanel initialization
  trackMessageNotificationTap(messageId, userAnalyticsOptIn);

  // We have a different behaviour based on the app status
  if (receivedInForeground) {
    // The App is in foreground so just refresh the messages list
    handleForegroundMessageReload(store);
  } else {
    // The App was closed/in background and has been now opened clicking
    // on the push notification.
    // Save the message id of the notification in the store so the App can
    // navigate to the message detail screen as soon as possible (if
    // needed after the user login/insert the unlock code)
    store.dispatch(
      updateNotificationsPendingMessage({
        id: messageId,
        foreground: false
      })
    );
  }
};

/**
 * Decide how to refresh the messages based on pagination.
 * It only reloads Inbox since Archive is never changed server-side.
 */
const handleForegroundMessageReload = (store: Store) => {
  const state = store.getState();
  // Make sure there are not progressing message loadings and
  // that the system is not processing any message archiving/restoring
  const allPaginated = state.entities.messages.allPaginated;
  const isProcessingArchivingOrRestoring =
    isArchivingInProcessingModeSelector(state);
  if (
    isLoadingOrUpdating(allPaginated.archive.data) ||
    isLoadingOrUpdating(allPaginated.inbox.data) ||
    isProcessingArchivingOrRestoring
  ) {
    return;
  }

  const { inbox: inboxIndexes } =
    getArchiveAndInboxNextAndPreviousPageIndexes(state);
  if (pot.isNone(inboxIndexes)) {
    // nothing in the collection, refresh
    store.dispatch(
      reloadAllMessages.request({ pageSize, filter: {}, fromUserAction: false })
    );
  } else if (pot.isSome(inboxIndexes)) {
    // something in the collection, get the maximum amount of new ones only,
    // assuming that the message will be there
    store.dispatch(
      loadPreviousPageMessages.request({
        cursor: inboxIndexes.value.previous,
        pageSize: maximumItemsFromAPI,
        filter: {},
        fromUserAction: false
      })
    );
  }
};

const getArchiveAndInboxNextAndPreviousPageIndexes = (state: GlobalState) => {
  const { archive, inbox } = state.entities.messages.allPaginated;
  return {
    archive: pot.map(archive.data, ({ previous, next }) => ({
      previous,
      next
    })),
    inbox: pot.map(inbox.data, ({ previous, next }) => ({ previous, next }))
  };
};

const handleTrackingOfTokenGeneration = (userAnalyticsOptIn: boolean) =>
  trackNewPushNotificationsTokenGenerated(
    Date.now().toString(),
    userAnalyticsOptIn
  );

const handleTrackingOfDecodingFailure = (
  reason: t.Errors | string,
  userAnalyticsOptIn: boolean
) =>
  trackMessageNotificationParsingFailure(
    Date.now().toString(),
    reason,
    userAnalyticsOptIn
  );

const hasUserOptedInForAnalytics = (state: GlobalState) =>
  isMixpanelEnabled(state) ?? false;

export const testable = isTestEnv
  ? {
      NotificationPayload,
      getArchiveAndInboxNextAndPreviousPageIndexes,
      handleForegroundMessageReload,
      handleMessagePushNotification,
      handleTrackingOfDecodingFailure,
      handleTrackingOfTokenGeneration,
      hasUserOptedInForAnalytics,
      parseNotificationPayload,
      onPushNotificationReceived,
      onPushNotificationTokenAvailable
    }
  : undefined;
