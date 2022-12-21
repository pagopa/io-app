import { ActionType } from "typesafe-actions";
import RNFS from "react-native-fs";
import { call } from "typed-redux-saga/macro";
import { removeCachedAttachment } from "../../../store/actions/messages";
import { AttachmentsDirectoryPath } from "./networking/downloadAttachment";

/**
 * Clears cached file for the attachment
 * @param action
 */
export function* clearAttachment(
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
export function* clearAllAttachments() {
  const isPresent = yield* call(RNFS.exists, AttachmentsDirectoryPath);

  if (isPresent) {
    yield* call(RNFS.unlink, AttachmentsDirectoryPath);
  }
}
