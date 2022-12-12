import { ActionType } from "typesafe-actions";
import RNFS from "react-native-fs";
import { AttachmentsDirectoryPath } from "./networking/downloadAttachment";
import { removeCachedAttachment } from "../../../store/actions/messages";

/**
 * Clears cached file for the attachment
 * @param action
 */
export function* clearAttachment(
  action: ActionType<typeof removeCachedAttachment>
) {
  const path = action.payload.path;
  if (path) {
    yield RNFS.exists(path).then(exists =>
      exists ? RNFS.unlink(path) : Promise.resolve()
    );
  }
}

/**
 * Clears cached files for all the attachments
 */
export function* clearAllAttachments() {
  yield RNFS.exists(AttachmentsDirectoryPath).then(exists =>
    exists ? RNFS.unlink(AttachmentsDirectoryPath) : Promise.resolve()
  );
}
