import { SagaIterator } from "redux-saga";
import {
  fork,
  put,
  select,
  takeEvery,
  takeLatest
} from "typed-redux-saga/macro";
import { SessionToken } from "../../../types/SessionToken";
import { clearCache } from "../../../store/actions/profile";
import { logoutSuccess } from "../../../store/actions/authentication";
import {
  downloadAttachment,
  getMessageDataAction,
  getMessagePrecondition,
  loadMessageById,
  loadMessageDetails,
  loadNextPageMessages,
  loadPreviousPageMessages,
  loadThirdPartyMessage,
  migrateToPaginatedMessages,
  reloadAllMessages,
  removeCachedAttachment,
  upsertMessageStatusAttributes
} from "../store/actions";
import { retryDataAfterFastLoginSessionExpirationSelector } from "../store/reducers/messageGetStatus";
import { BackendClient } from "../../../api/backend";
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
import { handleUpsertMessageStatusAttribues } from "./handleUpsertMessageStatusAttribues";
import { handleMigrateToPagination } from "./handleMigrateToPagination";
import { handleMessagePrecondition } from "./handleMessagePrecondition";
import { handleThirdPartyMessage } from "./handleThirdPartyMessage";
import { handlePaymentUpdateRequests } from "./handlePaymentUpdateRequests";

/**
 * Handle messages requests
 * @param backendClient
 * @param bearerToken
 */
export function* watchMessagesSaga(
  backendClient: BackendClient,
  bearerToken: SessionToken
): SagaIterator {
  yield* takeLatest(
    loadNextPageMessages.request,
    handleLoadNextPageMessages,
    backendClient.getMessages
  );

  yield* takeLatest(
    loadPreviousPageMessages.request,
    handleLoadPreviousPageMessages,
    backendClient.getMessages
  );

  yield* takeLatest(
    reloadAllMessages.request,
    handleReloadAllMessages,
    backendClient.getMessages
  );

  yield* takeEvery(
    loadMessageById.request,
    handleLoadMessageById,
    backendClient.getMessage
  );

  yield* takeLatest(
    loadMessageDetails.request,
    handleLoadMessageDetails,
    backendClient.getMessage
  );

  yield* takeLatest(
    getMessagePrecondition.request,
    handleMessagePrecondition,
    backendClient.getThirdPartyMessagePrecondition
  );

  yield* takeLatest(
    loadThirdPartyMessage.request,
    handleThirdPartyMessage,
    backendClient.getThirdPartyMessage
  );

  yield* takeEvery(
    upsertMessageStatusAttributes.request,
    handleUpsertMessageStatusAttribues,
    backendClient.upsertMessageStatusAttributes
  );

  yield* fork(watchLoadMessageData);

  yield* takeLatest(
    migrateToPaginatedMessages.request,
    handleMigrateToPagination,
    backendClient.upsertMessageStatusAttributes
  );

  // handle the request for a new downloadAttachment
  yield* takeLatest(
    downloadAttachment.request,
    handleDownloadAttachment,
    bearerToken
  );

  // handle the request for updating a message's payment
  yield* fork(handlePaymentUpdateRequests, backendClient.getVerificaRpt);

  // handle the request for removing a downloaded attachment
  yield* takeEvery(removeCachedAttachment, handleClearAttachment);

  // handle the request for clearing user profile cache
  yield* takeEvery(clearCache, handleClearAllAttachments);

  // clear cache when user explicitly logs out
  yield* takeEvery(logoutSuccess, handleClearAllAttachments);
}

function* watchLoadMessageData() {
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
