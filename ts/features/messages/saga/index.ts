import { SagaIterator } from "redux-saga";
import {
  fork,
  put,
  select,
  takeEvery,
  takeLatest
} from "typed-redux-saga/macro";
import { clearCache } from "../../settings/common/store/actions";
import { logoutSuccess } from "../../authentication/common/store/actions";
import {
  downloadAttachment,
  getMessageDataAction,
  loadMessageById,
  loadMessageDetails,
  loadNextPageMessages,
  loadPreviousPageMessages,
  loadThirdPartyMessage,
  reloadAllMessages,
  removeCachedAttachment,
  startPaymentStatusTracking,
  upsertMessageStatusAttributes
} from "../store/actions";
import { retryDataAfterFastLoginSessionExpirationSelector } from "../store/reducers/messageGetStatus";
import { retrievingDataPreconditionStatusAction } from "../store/actions/preconditions";
import { startProcessingMessageArchivingAction } from "../store/actions/archiving";
import { handleDownloadAttachment } from "./handleDownloadAttachment";
import {
  handleClearAllAttachments,
  handleClearAttachment
} from "./handleClearAttachments";
import { handleLoadMessageData } from "./handleLoadMessageData";
import { handleLoadNextPageMessages } from "./handleLoadNextPageMessages";
import { handleLoadPreviousPageMessages } from "./handleLoadPreviousPageMessages";
import { handleReloadAllMessages } from "./handleReloadAllMessages";
import { handleLoadMessageById } from "./handleLoadMessageById";
import { handleLoadMessageDetails } from "./handleLoadMessageDetails";
import {
  handleMessageArchivingRestoring,
  raceUpsertMessageStatusAttributes
} from "./handleUpsertMessageStatusAttributes";
import { handleMessagePrecondition } from "./handleMessagePrecondition";
import { handleThirdPartyMessage } from "./handleThirdPartyMessage";
import { handlePaymentStatusForAnalyticsTracking } from "./handlePaymentStatusForAnalyticsTracking";
import { handlePaymentUpdateRequests } from "./handlePaymentUpdateRequests";

/**
 * Handle messages requests
 * @param backendClient
 * @param bearerToken
 */
export function* watchMessagesSaga(): SagaIterator {
  yield* takeLatest(loadNextPageMessages.request, handleLoadNextPageMessages);

  yield* takeLatest(
    loadPreviousPageMessages.request,
    handleLoadPreviousPageMessages
  );

  yield* takeLatest(reloadAllMessages.request, handleReloadAllMessages);

  yield* takeEvery(loadMessageById.request, handleLoadMessageById);

  yield* takeLatest(loadMessageDetails.request, handleLoadMessageDetails);

  yield* takeLatest(
    retrievingDataPreconditionStatusAction,
    handleMessagePrecondition
  );

  yield* takeLatest(loadThirdPartyMessage.request, handleThirdPartyMessage);

  // Be aware that this saga must use the takeEvery
  // due to compatibility with the old messages home
  yield* takeEvery(
    upsertMessageStatusAttributes.request,
    raceUpsertMessageStatusAttributes
  );
  yield* takeLatest(
    startProcessingMessageArchivingAction,
    handleMessageArchivingRestoring
  );

  // handle the request for a new downloadAttachment
  yield* takeLatest(downloadAttachment.request, handleDownloadAttachment);

  // handle the request for updating a message's payment
  yield* fork(handlePaymentUpdateRequests);

  // handle the request for removing a downloaded attachment
  yield* takeEvery(removeCachedAttachment, handleClearAttachment);

  // handle the request for clearing user profile cache
  yield* takeEvery(clearCache, handleClearAllAttachments);

  // clear cache when user explicitly logs out
  yield* takeEvery(logoutSuccess, handleClearAllAttachments);

  // Message Payments analytics
  yield* takeLatest(
    startPaymentStatusTracking,
    handlePaymentStatusForAnalyticsTracking
  );

  // handle message details data loading composition
  yield* takeLatest(getMessageDataAction.request, handleLoadMessageData);

  const retryDataOrUndefined = yield* select(
    retryDataAfterFastLoginSessionExpirationSelector
  );
  if (retryDataOrUndefined) {
    yield* put(
      getMessageDataAction.request({
        messageId: retryDataOrUndefined.messageId,
        fromPushNotification: retryDataOrUndefined.fromPushNotification
      })
    );
  }
}
