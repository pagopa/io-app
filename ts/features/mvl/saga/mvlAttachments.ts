import { ActionType } from "typesafe-actions";
import RNFS from "react-native-fs";
import { mvlRemoveCachedAttachment } from "../store/actions/downloads";
import { MvlAttachmentsDirectoryPath } from "./networking/downloadMvlAttachment";

/**
 * Clears cached file for the attachment
 * @param action
 */
export function* clearMvlAttachment(
  action: ActionType<typeof mvlRemoveCachedAttachment>
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
export function* clearAllMvlAttachments() {
  yield RNFS.exists(MvlAttachmentsDirectoryPath).then(exists =>
    exists ? RNFS.unlink(MvlAttachmentsDirectoryPath) : Promise.resolve()
  );
}
