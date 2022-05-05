import { ActionType } from "typesafe-actions";
import RNFS from "react-native-fs";
import { mvlRemoveCachedAttachment } from "../store/actions/downloads";

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
