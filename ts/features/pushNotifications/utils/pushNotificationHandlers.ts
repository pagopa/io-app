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
    trackMessageNotificationTap(messageId, isAnalyticsOptedIn);

    if (receivedInForeground) {
      handleForegroundMessageReload(store);
    } else {
      store.dispatch(
        updateNotificationsPendingMessage({
          id: messageId,
          foreground: false
        })
      );
    }
  }
};

const handleForegroundMessageReload = (store: Store) => {
  const state = store.getState();
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
    store.dispatch(
      reloadAllMessages.request({ pageSize, filter: {}, fromUserAction: false })
    );
  } else if (pot.isSome(inboxIndexes)) {
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
