import { SagaIterator } from "redux-saga";
import {
  call,
  race,
  take,
  takeEvery,
  takeLatest
} from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SessionToken } from "../../../types/SessionToken";
import { clearCache } from "../../../store/actions/profile";
import { logoutSuccess } from "../../../store/actions/authentication";
import {
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
  // handle the request for a new downloadAttachment. We need to race
  // both download and cancellation since the user can cancel the
  // download and then re-start it. This must cause the original
  // downloadAttachmentSaga to cancel. Relying on downloadAttachmentSaga
  // to send the downloadAttachment.cancel event upon cancellation will
  // cause a cancel action to dispatch after the renewed
  // downloadAttachment.request action had been launched
  yield* takeLatest(
    downloadAttachment.request,
    function* (action: ActionType<typeof downloadAttachment.request>) {
      yield* race({
        task: call(downloadAttachmentSaga, bearerToken, action),
        cancel: take(downloadAttachment.cancel)
      });
    }
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
