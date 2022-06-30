import { ActionType } from "typesafe-actions";
import RNFS from "react-native-fs";
import ReactNativeBlobUtil from "react-native-blob-util";
import { call, cancelled, put } from "typed-redux-saga/macro";
import { mvlAttachmentDownload } from "../../store/actions/downloads";
import { fetchTimeout } from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";
import { MvlAttachment } from "../../types/mvlData";
import { getError } from "../../../../utils/errors";

export const MvlAttachmentsDirectoryPath =
  RNFS.CachesDirectoryPath + "/mvl/attachments";

/**
 * Builds the save path for the given attachment
 * @param attachment
 */
const savePath = (attachment: MvlAttachment) =>
  MvlAttachmentsDirectoryPath +
  "/" +
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
    const config = yield* call(ReactNativeBlobUtil.config, {
      path: savePath(attachment),
      timeout: fetchTimeout
    });
    const result = yield* call(
      config.fetch,
      "GET",
      attachment.resourceUrl.href,
      {
        Authorization: `Bearer ${bearerToken}`
      }
    );
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
  } catch (error) {
    yield* put(
      mvlAttachmentDownload.failure({
        attachment,
        error: getError(error)
      })
    );
  } finally {
    if (yield* cancelled()) {
      yield* put(mvlAttachmentDownload.cancel(attachment));
    }
  }
}
