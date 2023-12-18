import { SagaIterator } from "redux-saga";
import {
  call,
  put,
  select,
  takeEvery,
  takeLatest
} from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { SessionToken } from "../../../types/SessionToken";
import { clearCache } from "../../../store/actions/profile";
import { logoutSuccess } from "../../../store/actions/authentication";
import {
  downloadAttachment,
  removeCachedAttachment
} from "../../../store/actions/messages";
import { getMessageDataAction } from "../actions";
import { retryDataAfterFastLoginSessionExpirationSelector } from "../../../store/reducers/entities/messages/messageGetStatus";
import { handleDownloadAttachment } from "./handleDownloadAttachment";
import {
  handleClearAllAttachments,
  handleClearAttachment
} from "./handleClearAttachments";
import { handleLoadMessageData } from "./handleLoadMessageData";

/**
 * Handle the message attachment requests
 * @param bearerToken
 */
export function* watchMessageAttachmentsSaga(
  bearerToken: SessionToken
): SagaIterator {
  // handle the request for a new downloadAttachment
  yield* takeLatest(
    downloadAttachment.request,
    handleDownloadAttachment,
    bearerToken
  );

  // handle the request for removing a downloaded attachment
  yield* takeEvery(
    removeCachedAttachment,
    function* (action: ActionType<typeof removeCachedAttachment>) {
      yield* call(handleClearAttachment, action);
    }
  );

  // handle the request for clearing user profile cache
  yield* takeEvery(clearCache, function* () {
    yield* call(handleClearAllAttachments);
  });

  // clear cache when user explicitly logs out
  yield* takeEvery(
    logoutSuccess,
    function* (_: ActionType<typeof logoutSuccess>) {
      yield* call(handleClearAllAttachments);
    }
  );
}

export function* watchLoadMessageData() {
  yield* takeLatest(
    getType(getMessageDataAction.request),
    handleLoadMessageData
  );

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
