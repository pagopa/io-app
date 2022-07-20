import { SagaIterator } from "redux-saga";
import { call, takeEvery, takeLatest } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SessionToken } from "../../../types/SessionToken";
import { clearCache } from "../../../store/actions/profile";
import { logoutSuccess } from "../../../store/actions/authentication";
import {
  mvlAttachmentDownload,
  mvlRemoveCachedAttachment
} from "../../mvl/store/actions/downloads";
import { downloadMvlAttachment } from "../../mvl/saga/networking/downloadMvlAttachment";
import {
  clearAllMvlAttachments,
  clearMvlAttachment
} from "../../mvl/saga/mvlAttachments";

/**
 * Handle the message attachment requests
 * @param bearerToken
 */
export function* watchMessageAttachmentsSaga(
  bearerToken: SessionToken
): SagaIterator {
  // handle the request for a new mvlAttachmentDownload
  yield* takeLatest(
    mvlAttachmentDownload.request,
    function* (action: ActionType<typeof mvlAttachmentDownload.request>) {
      yield* call(downloadMvlAttachment, bearerToken, action);
    }
  );

  // handle the request for removing a downloaded attachment
  yield* takeEvery(
    mvlRemoveCachedAttachment,
    function* (action: ActionType<typeof mvlRemoveCachedAttachment>) {
      yield* call(clearMvlAttachment, action);
    }
  );

  // handle the request for clearing user profile cache
  yield* takeEvery(clearCache, function* () {
    yield* call(clearAllMvlAttachments);
  });

  // clear cache when user explicitly logs out
  yield* takeEvery(
    logoutSuccess,
    function* (action: ActionType<typeof logoutSuccess>) {
      if (!action.payload.keepUserData) {
        yield* call(clearAllMvlAttachments);
      }
    }
  );
}
