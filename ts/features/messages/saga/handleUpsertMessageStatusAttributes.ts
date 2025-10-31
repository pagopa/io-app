import {
  call,
  cancelled,
  put,
  race,
  take,
  select
} from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import I18n from "i18next";
import { MessageStatusArchivingChange } from "../../../../definitions/backend/MessageStatusArchivingChange";
import { MessageStatusBulkChange } from "../../../../definitions/backend/MessageStatusBulkChange";
import { MessageStatusChange } from "../../../../definitions/backend/MessageStatusChange";
import { MessageStatusReadingChange } from "../../../../definitions/backend/MessageStatusReadingChange";
import { BackendClient } from "../../../api/backend";
import {
  upsertMessageStatusAttributes,
  UpsertMessageStatusAttributesPayload
} from "../store/actions";
import { SagaCallReturnType } from "../../../types/utils";
import { getError } from "../../../utils/errors";
import { withRefreshApiCall } from "../../authentication/fastLogin/saga/utils";
import { errorToReason, unknownToReason } from "../utils";
import {
  trackArchivedRestoredMessages,
  trackUpsertMessageStatusAttributesFailure
} from "../analytics";
import { handleResponse } from "../utils/responseHandling";
import {
  resetMessageArchivingAction,
  interruptMessageArchivingProcessingAction,
  removeScheduledMessageArchivingAction,
  startProcessingMessageArchivingAction
} from "../store/actions/archiving";
import { nextQueuedMessageDataUncachedSelector } from "../store/reducers/archiving";
import { paginatedMessageFromIdForCategorySelector } from "../store/reducers/allPaginated";
import { MessageListCategory } from "../types/messageListCategory";
import { sessionTokenSelector } from "../../authentication/common/store/selectors";
import { backendClientManager } from "../../../api/BackendClientManager";
import { apiUrlPrefix } from "../../../config";

/**
 * @throws invalid payload
 * @param payload
 */
function validatePayload(
  payload: UpsertMessageStatusAttributesPayload
): MessageStatusChange {
  switch (payload.update.tag) {
    case "archiving":
      return {
        change_type: "archiving",
        is_archived: payload.update.isArchived
      } as MessageStatusArchivingChange;
    case "reading":
      return {
        change_type: "reading",
        is_read: true
      } as MessageStatusReadingChange;
    case "bulk":
      return {
        change_type: "bulk",
        is_read: true,
        is_archived: payload.update.isArchived
      } as MessageStatusBulkChange;
    default:
      throw new TypeError("invalid payload");
  }
}

/**
 * The algorithm of this saga is as follows:
 *
 * Get awaken by the receival of `startProcessingMessageArchivingAction` in takeLastest mode
 * do {
 *   Extract the first message ID for archiving/restoring queues, along with the info about archiving or restoring the message
 *   If no data was returned, then the process has ended. Dispatch resetMessageArchivingAction with success
 *   Otherwise
 *     Given the message id, look for it in the related message page (inbox or archived)
 *     If no message has been found, then it was already processed somehow, just discard the ID from the archiving/restoring queues
 *       (by dispatching removeScheduledMessageArchivingAction) and continue to the next do-while loop interaction
 *     Otherwise
 *       Build and dispatch the legacy upsertMessageStatusAttributes.request. Such action triggers the legacy saga which uses the
 *        legacy archiving/restoring logic to move the message to the other list, contact the server and, in case of a failure, puts
 *        back the message to the source list). Such saga is raced against resetMessageArchivingAction in order to be cancelable
 *       Listen for the saga async output action, which is either upsertMessageStatusAttributes.success or upsertMessageStatusAttributes.success
 *         but also for resetMessageArchivingAction to avoid a race conidtion where the saga fails one moment before the user cancels the
 *         processing (dispatching resetMessageArchivingAction by the UI button)
 *       If upsertMessageStatusAttributes.failure is received, then cancel the processing using interruptMessageArchivingProcessingAction (which
 *         does not clear the user selection) and stop the current saga
 *       If upsertMessageStatusAttributes.success is received, then discard the ID from the archiving/restoring queues (by dispatching
 *         removeScheduledMessageArchivingAction) and continue to the next do-while loop interaction
 *       If resetMessageArchivingAction is received, then just go to the next do-while loop interaction, which will extract no data from the
 *         archiving/restoring queues (since they have been emptied by resetMessageArchivingAction) and will terminate
 * } while (true)
 *
 * If the session expires (due to fast login), it is expected that the legacy saga fails with a 401 error and the
 * 'upsertMessageStatusAttributes.failure' is triggered. If the authentication session is later restored, the original
 * 'upsertMessageStatusAttributes.request' action will be redispatched and the related legacy saga will either succeed or fail. At this point
 * the user may either discard the scheduled archiving/restoring of messages, in which case the UI is consistent (since the message has been
 * moved) or she may retry the restoring/archiving, in which case the message ID will not have a match into the original message collection
 * (INBOX or ARCHIVE) and so it will just be discarded, leaving the UI consistent. In case the automatically dispatched action from fast
 * login had failed, there will be a match and the process will resume.
 *
 */
export function* handleMessageArchivingRestoring(
  _: ActionType<typeof startProcessingMessageArchivingAction>
) {
  const analyticsData = generateArchiveRestoreAnalyticsData();
  do {
    const currentEntryToProcess = yield* select(
      nextQueuedMessageDataUncachedSelector
    );
    if (!currentEntryToProcess) {
      trackAnalyticsData(analyticsData);
      const userFeedback = I18n.t("messages.operations.generic.success");
      yield* put(
        resetMessageArchivingAction({ type: "success", reason: userFeedback })
      );
      return;
    }

    const category: MessageListCategory = currentEntryToProcess.archiving
      ? "INBOX"
      : "ARCHIVE";
    const message = yield* select(
      paginatedMessageFromIdForCategorySelector,
      currentEntryToProcess.messageId,
      category
    );
    if (!message) {
      yield* put(
        removeScheduledMessageArchivingAction({
          fromInboxToArchive: currentEntryToProcess.archiving,
          messageId: currentEntryToProcess.messageId
        })
      );
      continue;
    }

    const upsertMessageStatusAttributesAction =
      upsertMessageStatusAttributes.request({
        message,
        update: {
          isArchived: currentEntryToProcess.archiving,
          tag: "archiving"
        }
      });
    yield* put(upsertMessageStatusAttributesAction);

    const outputAction = yield* take([
      upsertMessageStatusAttributes.success,
      upsertMessageStatusAttributes.failure,
      resetMessageArchivingAction
    ]);

    if (isActionOf(upsertMessageStatusAttributes.success, outputAction)) {
      updateAnalyticsData(analyticsData, currentEntryToProcess.archiving);
      yield* put(
        removeScheduledMessageArchivingAction({
          fromInboxToArchive: currentEntryToProcess.archiving,
          messageId: currentEntryToProcess.messageId
        })
      );
    } else {
      if (isActionOf(upsertMessageStatusAttributes.failure, outputAction)) {
        const userFeedback = I18n.t("messages.operations.generic.failure");
        yield* put(
          interruptMessageArchivingProcessingAction({
            type: "error",
            reason: userFeedback
          })
        );
      }
      return;
    }
  } while (true);
}

// Be aware that this saga is execute with a takeEvery, in order to remain
// compatible with the old messages home way of archiving messages
export function* raceUpsertMessageStatusAttributes(
  action: ActionType<typeof upsertMessageStatusAttributes.request>
) {
  const sessionToken = yield* select(sessionTokenSelector);

  if (!sessionToken) {
    // TODO: add MP tech event https://pagopa.atlassian.net/browse/IOPID-3528
    return;
  }

  const { upsertMessageStatusAttributes: putMessage } =
    backendClientManager.getBackendClient(apiUrlPrefix, sessionToken);

  yield* race({
    task: call(handleUpsertMessageStatusAttributes, putMessage, action),
    cancel: take(resetMessageArchivingAction)
  });
}

export function* handleUpsertMessageStatusAttributes(
  putMessage: BackendClient["upsertMessageStatusAttributes"],
  action: ActionType<typeof upsertMessageStatusAttributes.request>
) {
  try {
    const body = validatePayload(action.payload);
    const response = (yield* call(
      withRefreshApiCall,
      putMessage({ id: action.payload.message.id, body }),
      action
    )) as SagaCallReturnType<typeof putMessage>;

    const nextAction = handleResponse<unknown>(
      response,
      _ => upsertMessageStatusAttributes.success(action.payload),
      error => {
        const reason = errorToReason(error);
        trackUpsertMessageStatusAttributesFailure(reason);
        return upsertMessageStatusAttributes.failure({
          error: getError(error),
          payload: action.payload
        });
      }
    );

    if (nextAction) {
      yield* put(nextAction);
    }
  } catch (error) {
    const reason = unknownToReason(error);
    trackUpsertMessageStatusAttributesFailure(reason);
    yield* put(
      upsertMessageStatusAttributes.failure({
        error: getError(error),
        payload: action.payload
      })
    );
  } finally {
    if (yield* cancelled()) {
      yield* put(
        upsertMessageStatusAttributes.failure({
          error: getError("Cancelled"),
          payload: action.payload
        })
      );
    }
  }
}

const analyticsDataKeyArchived = "archived";
const analyticsDataKeyRestored = "restored";

const generateArchiveRestoreAnalyticsData = () => {
  const analyticsData = new Map<string, number>();
  analyticsData.set(analyticsDataKeyArchived, 0);
  analyticsData.set(analyticsDataKeyRestored, 0);
  return analyticsData;
};

const updateAnalyticsData = (
  analyticsData: Map<string, number>,
  archiving: boolean
) => {
  const analyticsDataKey = archiving
    ? analyticsDataKeyArchived
    : analyticsDataKeyRestored;
  analyticsData.set(
    analyticsDataKey,
    1 + (analyticsData.get(analyticsDataKey) ?? 0)
  );
};

const trackAnalyticsData = (analyticsData: Map<string, number>) => {
  const archivedMessageCount = analyticsData.get(analyticsDataKeyArchived) ?? 0;
  if (archivedMessageCount > 0) {
    trackArchivedRestoredMessages(true, archivedMessageCount);
  }
  const restoredMessageCount = analyticsData.get(analyticsDataKeyRestored) ?? 0;
  if (restoredMessageCount > 0) {
    trackArchivedRestoredMessages(false, restoredMessageCount);
  }
};
