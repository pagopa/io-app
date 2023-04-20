import { SagaIterator } from "redux-saga";
import { call, takeEvery, takeLatest } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SessionToken } from "../../../types/SessionToken";
import { clearCache } from "../../../store/actions/profile";
import { logoutSuccess } from "../../../store/actions/authentication";
import {
  cancelPreviousAttachmentDownload,
  downloadAttachment,
  removeCachedAttachment
} from "../../../store/actions/messages";
import { downloadAttachmentSaga } from "./networking/downloadAttachment";
import { clearAllAttachments, clearAttachment } from "./clearAttachments";

/**
 * Handle the message attachment requests
 * @param bearerToken
 */
export function* watchMessageAttachmentsSaga(
  bearerToken: SessionToken
): SagaIterator {
  // Handle the request for a new downloadAttachment.
  // The first action (downloadAttachment.request) is the one
  // that effectively handle a download while the second one
  // (cancelPreviousAttachmentDownload) is required in order to
  // cancel any previous download that was going on (since the
  // cancelling can either be triggered by requesting a different
  // download - where we do not know if there was a previous download
  // and/or which one it is, on PN attachments - or manually by the
  // user on generic attachments). The downloadAttachmentSaga
  // has a finally block that triggers the reducer function updating
  // the download pot's status and it also stops itself if the
  // input action is not downloadAttachment.request
  yield* takeLatest(
    [downloadAttachment.request, cancelPreviousAttachmentDownload],
    downloadAttachmentSaga,
    bearerToken
  );

  // handle the request for removing a downloaded attachment
  yield* takeEvery(
    removeCachedAttachment,
    function* (action: ActionType<typeof removeCachedAttachment>) {
      yield* call(clearAttachment, action);
    }
  );

  // handle the request for clearing user profile cache
  yield* takeEvery(clearCache, function* () {
    yield* call(clearAllAttachments);
  });

  // clear cache when user explicitly logs out
  yield* takeEvery(
    logoutSuccess,
    function* (_: ActionType<typeof logoutSuccess>) {
      yield* call(clearAllAttachments);
    }
  );
}
