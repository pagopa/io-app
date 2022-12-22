import { ActionType } from "typesafe-actions";
import RNFS from "react-native-fs";
import ReactNativeBlobUtil from "react-native-blob-util";
import { call, cancelled, put } from "typed-redux-saga/macro";
import { fetchTimeout } from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";
import { getError } from "../../../../utils/errors";
import { downloadAttachment } from "../../../../store/actions/messages";
import { UIAttachment } from "../../../../store/reducers/entities/messages/types";

export const AttachmentsDirectoryPath =
  RNFS.CachesDirectoryPath + "/attachments";

/**
 * Builds the save path for the given attachment
 * @param attachment
 */
const savePath = (attachment: UIAttachment) =>
  AttachmentsDirectoryPath +
  "/" +
  attachment.messageId +
  "/" +
  attachment.id +
  "/" +
  attachment.displayName;

/**
 * Handles the download of an attachment
 * @param bearerToken
 * @param action
 */
export function* downloadAttachmentSaga(
  bearerToken: SessionToken,
  action: ActionType<typeof downloadAttachment.request>
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
        downloadAttachment.failure({
          attachment,
          error
        })
      );
      return;
    }
    const path = result.path();
    yield* put(downloadAttachment.success({ attachment, path }));
  } catch (error) {
    yield* put(
      downloadAttachment.failure({
        attachment,
        error: getError(error)
      })
    );
  } finally {
    if (yield* cancelled()) {
      yield* put(downloadAttachment.cancel(attachment));
    }
  }
}
