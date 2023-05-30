import I18n from "i18n-js";
import { ActionType, isActionOf } from "typesafe-actions";
import RNFS from "react-native-fs";
import ReactNativeBlobUtil from "react-native-blob-util";
import { call, cancelled, put, select } from "typed-redux-saga/macro";
import { v4 as uuid } from "uuid";
import { fetchTimeout } from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";
import { getError } from "../../../../utils/errors";
import {
  cancelPreviousAttachmentDownload,
  downloadAttachment
} from "../../../../store/actions/messages";
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
} from "../../analytics";
import { lollipopKeyTagSelector, lollipopPublicKeySelector } from "../../../lollipop/store/reducers/lollipop";
import { generateKeyInfo } from "../../../lollipop/saga";
import { LollipopConfig } from "../../../lollipop";
import { lollipopRequestInit } from "../../../lollipop/utils/fetch";
import { isTestEnv } from "../../../../utils/environment";

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
  action:
    | ActionType<typeof downloadAttachment.request>
    | ActionType<typeof cancelPreviousAttachmentDownload>
) {
  // This function is triggered by either a downloadAttachment.request
  // or a cancelPreviousAttachmentDownload action. The idea behind it
  // is to launch the downloadAttachment.cancel action when (this saga)
  // is automatically cancelled by receiveing either one of the mentioned
  // actions. In this way, the download pot's status in the reducer will
  // be properly updated.
  // Of course, this saga runs only for an downloadAttachment.request
  // action while it stops immediately in any other case
  if (isActionOf(cancelPreviousAttachmentDownload, action)) {
    return;
  }

  const attachment = action.payload;
  const attachmentCategory = attachment.category;
  const messageId = attachment.messageId;
  const serviceId = yield* select(getServiceByMessageId, messageId);

  try {
    const config = yield* call(ReactNativeBlobUtil.config, {
      path: savePath(attachment),
      timeout: fetchTimeout
    });

    const { method, attachmentFullUrl, headers } = yield* call(generateReactNativeBlobUtilsFetchParameters, attachment, bearerToken);
    const result = yield* call(
      config.fetch,
      method,
      attachmentFullUrl,
      headers
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
  } finally {
    if (yield* cancelled()) {
      yield* put(downloadAttachment.cancel(attachment));
    }
  }
}

type HeaderType = { [key: string]: string };

function* generateReactNativeBlobUtilsFetchParameters(attachment: UIAttachment, bearerToken: string) {
  const lollopopConfig = {
    nonce: uuid()
  } as LollipopConfig;

  const keyTag = yield* select(lollipopKeyTagSelector);
  const publicKey = yield* select(lollipopPublicKeySelector);
  const keyInfo = yield* call(generateKeyInfo, keyTag, publicKey);

  const attachmentFullUrl = attachment.resourceUrl.href;

  const requestInit = {
    headers: {
      Authorization: `Bearer ${bearerToken}`
    } as HeaderType,
    method: "GET" as const
   };

   try {
    const lollipopInit = yield* call(lollipopRequestInit, lollopopConfig, keyInfo, attachmentFullUrl, requestInit); 
    return reactNativeBlobUtilsFetchParametersFactory(requestInit.method, attachmentFullUrl, (lollipopInit.headers ?? requestInit.headers) as HeaderType);
   } catch {
    // We are not interested in doing anything here, since the
    // later http call will be refused by the lollipop consumer
   }

   return reactNativeBlobUtilsFetchParametersFactory(requestInit.method, attachmentFullUrl, requestInit.headers);
}

const reactNativeBlobUtilsFetchParametersFactory = (method: "GET", attachmentFullUrl: string, headers: HeaderType) => ({ method, attachmentFullUrl, headers });

// Test that , having mocked lollipopRequestInit to succeed, function generateReactNativeBlobUtilsFetchParameters returns the enhanced headers
// Test that , having mocked lollipopRequestInit to fail, function generateReactNativeBlobUtilsFetchParameters returns the standard headers

export const testableData = isTestEnv ? { generateReactNativeBlobUtilsFetchParameters, reactNativeBlobUtilsFetchParametersFactory } : undefined;