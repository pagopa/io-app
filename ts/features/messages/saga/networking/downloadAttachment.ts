import I18n from "i18n-js";
import { ActionType } from "typesafe-actions";
import RNFS from "react-native-fs";
import ReactNativeBlobUtil from "react-native-blob-util";
import { call, put, select } from "typed-redux-saga/macro";
import { fetchTimeout } from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";
import { getError } from "../../../../utils/errors";
import { downloadAttachment } from "../../../../store/actions/messages";
import {
  AttachmentType,
  UIAttachment,
  UIMessageId
} from "../../../../store/reducers/entities/messages/types";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { getServiceByMessageId } from "../../../../store/reducers/entities/messages/paginatedById";
import {
  trackThirdPartyMessageAttachmentBadFormat,
  trackThirdPartyMessageAttachmentDownloadFailed,
  trackThirdPartyMessageAttachmentUnavailable
} from "../../../../utils/analytics";

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

function trackFailureEvent(
  category: AttachmentType,
  httpStatusCode: number,
  messageId: UIMessageId,
  serviceId: ServiceId | undefined
): void {
  if (category !== "GENERIC") {
    return;
  }
  if (httpStatusCode === 500) {
    trackThirdPartyMessageAttachmentUnavailable(messageId, serviceId);
  } else if (httpStatusCode === 415) {
    trackThirdPartyMessageAttachmentBadFormat(messageId, serviceId);
  } else if (httpStatusCode <= 200 || httpStatusCode >= 400) {
    trackThirdPartyMessageAttachmentDownloadFailed(messageId, serviceId);
  }
}

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
  const attachmentCategory = attachment.category;
  const messageId = attachment.messageId;
  const serviceId = yield* select(getServiceByMessageId, messageId);

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
      trackFailureEvent(
        attachmentCategory,
        status,
        attachment.messageId,
        serviceId
      );
      // In this case we produce a taking error that can be
      // shown directly to the user
      const errorKey =
        status === 415
          ? "messageDetails.attachments.badFormat"
          : "messageDetails.attachments.downloadFailed";
      const error = new Error(I18n.t(errorKey));
      yield* put(downloadAttachment.failure({ attachment, error }));
      return;
    }
  } catch (error) {
    trackFailureEvent(attachmentCategory, 0, attachment.messageId, serviceId);
    yield* put(
      downloadAttachment.failure({
        attachment,
        error: getError(error)
      })
    );
  }
}
