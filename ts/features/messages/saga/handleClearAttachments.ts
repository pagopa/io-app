import { ActionType } from "typesafe-actions";
import { call } from "typed-redux-saga/macro";
import RNFS from "react-native-fs";
import { removeCachedAttachment } from "../store/actions";
import { AttachmentsDirectoryPath } from "../utils/attachments";

/**
 * Clears cached file for the attachment
 * @param action
 */
export function* handleClearAttachment(
  action: ActionType<typeof removeCachedAttachment>
) {
  const path = action.payload.path;
  if (path) {
    const isPresent = yield* call(RNFS.exists, path);

    if (isPresent) {
      yield* call(RNFS.unlink, path);
    }
  }
}

/**
 * Clears cached files for all the attachments
 */
export function* handleClearAllAttachments() {
  const isPresent = yield* call(RNFS.exists, AttachmentsDirectoryPath);

  if (isPresent) {
    yield* call(RNFS.unlink, AttachmentsDirectoryPath);
  }
}
