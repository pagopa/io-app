import { ActionType } from "typesafe-actions";
import RNFS from "react-native-fs";
import ReactNativeBlobUtil from "react-native-blob-util";
import { cancelled, put } from "typed-redux-saga/macro";
import {
  mvlAttachmentDownload,
  mvlRemoveCachedAttachment
} from "../../store/actions/downloads";
import { fetchTimeout } from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";
import { MvlAttachment } from "../../types/mvlData";

/**
 * Builds the save path for the given attachment
 * @param attachment
 */
const savePath = (attachment: MvlAttachment) =>
  RNFS.CachesDirectoryPath +
  "/mvl/attachments/" +
  attachment.id +
  "/" +
  attachment.displayName;

/**
 * Handles the download of an MVL attachment
 * @param bearerToken
 * @param action
 */
export function* downloadMvlAttachment(
  bearerToken: SessionToken,
  action: ActionType<typeof mvlAttachmentDownload.request>
) {
  const attachment = action.payload;

  try {
    const result = yield ReactNativeBlobUtil.config({
      path: savePath(attachment),
      timeout: fetchTimeout
    }).fetch("GET", attachment.resourceUrl.href, {
      Authorization: `Bearer ${bearerToken}`
    });
    const { status } = result.info();
    if (status !== 200) {
      const error = new Error(
        `error ${status} fetching ${attachment.resourceUrl.href}`
      );
      yield* put(
        mvlAttachmentDownload.failure({
          attachment,
          error
        })
      );
      return;
    }
    const path = result.path();
    yield* put(mvlAttachmentDownload.success({ attachment, path }));
  } finally {
    if (yield* cancelled()) {
      yield* put(
        mvlAttachmentDownload.failure({
          attachment
        })
      );
    }
  }
}

/**
 * Clears any cached file of the attachment
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
