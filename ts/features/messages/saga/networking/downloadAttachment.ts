import I18n from "i18n-js";
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
    if (status === 200) {
      const path = result.path();
      yield* put(downloadAttachment.success({ attachment, path }));
    } else {
      const errorKey =
        status === 415
          ? "messageDetails.attachments.badFormat"
          : "messageDetails.attachments.downloadFailed";
      const error = new Error(I18n.t(errorKey));
      yield* put(downloadAttachment.failure({ attachment, error }));
      return;
    }
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
