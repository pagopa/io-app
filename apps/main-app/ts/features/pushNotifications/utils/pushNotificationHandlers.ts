import * as pot from "@pagopa/ts-commons/lib/pot";
import * as Notifications from "expo-notifications";
import _ from "lodash";

import { maximumItemsFromAPI, pageSize } from "../../../config";
import { Store } from "../../../store/actions/types";
import { GlobalState } from "../../../store/reducers/types";
import { isTestEnv } from "../../../utils/environment";
import { isLoadingOrUpdating } from "../../../utils/pot";
import { trackMessageNotificationTap } from "../../messages/analytics";
import {
  loadPreviousPageMessages,
  reloadAllMessages
} from "../../messages/store/actions";
import { isArchivingInProcessingModeSelector } from "../../messages/store/reducers/archiving";
import { updateNotificationsPendingMessage } from "../store/actions/pendingMessage";

/**
 * Messages' feature logic linked to push notifications interactions if the
 * notification includes a messageId in its payload, it will reload the messages
 * list, else no logic will be ran.
 */
export const handleMessageNotificationInteraction = (
  response: Notifications.NotificationResponse,
  receivedInForeground: boolean,
  store: Store,
  isAnalyticsOptedIn: boolean
) => {
  const messageId = messageIdFromNotificationRequest(
    response.notification.request
  );
  if (messageId != null) {
    // tracks the event directly or enqueues it for later processing
    trackMessageNotificationTap(messageId, isAnalyticsOptedIn);

    if (receivedInForeground) {
      // if in foreground, just refresh the messages list
      handleForegroundMessageReload(store);
    } else {
      // if the app was instead woken by the notification interaction,
      // store the message from its payload so that the app can navigate to
      // the message details screen as soon as possible
      store.dispatch(
        updateNotificationsPendingMessage({
          id: messageId,
          foreground: false
        })
      );
    }
  }
};

/**
 * Decides how to refresh the messages based on pagination. It only reloads
 * Inbox since Archive is never changed server-side.
 */
const handleForegroundMessageReload = (store: Store) => {
  const state = store.getState();
  // Make sure there are not progressing message loadings and
  // that the system is not processing any message archiving/restoring
  const allPaginated = state.entities.messages.allPaginated;
  const isProcessingArchivingOrRestoring =
    isArchivingInProcessingModeSelector(state);

  const isLoadingArchive = isLoadingOrUpdating(allPaginated.archive.data);
  const isLoadingInbox = isLoadingOrUpdating(allPaginated.inbox.data);

  if (isLoadingArchive || isLoadingInbox || isProcessingArchivingOrRestoring) {
    return;
  }

  const { inbox: inboxIndexes } =
    getArchiveAndInboxNextAndPreviousPageIndexes(state);

  if (pot.isNone(inboxIndexes)) {
    // collection is empty, refresh
    store.dispatch(
      reloadAllMessages.request({
        pageSize,
        filter: {},
        fromUserAction: false
      })
    );
  } else if (pot.isSome(inboxIndexes)) {
    // current collection exists, fetch the maximum number of new
    // items from the API assuming the response will include
    //  the message linked to the received messageId
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

// ----------------------------------------------------------- UTILS -------------------------------------------------------------

const messageIdFromNotificationRequest = (
  notificationRequest: Notifications.NotificationRequest
): string | undefined =>
  _.get(notificationRequest, ["content", "data", "message_id"]) ?? // expo standard path
  _.get(notificationRequest, [
    "trigger",
    "remoteMessage",
    "data",
    "message_id"
  ]) ?? // android path
  _.get(notificationRequest, ["trigger", "payload", "message_id"]); // ios path

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

export const testable = isTestEnv
  ? {
      messageIdFromNotificationRequest,
      getArchiveAndInboxNextAndPreviousPageIndexes,
      handleForegroundMessageReload
    }
  : undefined;
