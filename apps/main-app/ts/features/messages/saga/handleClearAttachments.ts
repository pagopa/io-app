import { File } from "expo-file-system";
import { call } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import { removeCachedAttachment } from "../store/actions";
import { AttachmentsDirectoryPath } from "../utils/attachments";

/**
 * Clears cached files for all the attachments
 */
export function* handleClearAllAttachments() {
  const dir = new File(AttachmentsDirectoryPath);
  if (dir.exists) {
    yield* call([dir, dir.delete]);
  }
}

/**
 * Clears cached file for the attachment
 * @param action
 */
export function* handleClearAttachment(
  action: ActionType<typeof removeCachedAttachment>
) {
  const path = action.payload.path;
  if (path) {
    const file = new File(path);
    if (file.exists) {
      yield* call([file, file.delete]);
    }
  }
}
