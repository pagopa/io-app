import { SagaIterator } from "redux-saga";
import { ActionType } from "typesafe-actions";
import {
  call,
  cancelled,
  delay,
  put,
  race,
  select,
  take
} from "typed-redux-saga/macro";
import RNFS from "react-native-fs";
import ReactNativeBlobUtil from "react-native-blob-util";
import { v4 as uuid } from "uuid";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import { NumberFromString } from "@pagopa/ts-commons/lib/numbers";
import I18n from "../../../i18n";
import { fetchTimeout } from "../../../config";
import { SessionToken } from "../../../types/SessionToken";
import { getError } from "../../../utils/errors";
import {
  cancelPreviousAttachmentDownload,
  downloadAttachment
} from "../store/actions";
import { UIAttachment, UIMessageId } from "../types";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { getServiceByMessageId } from "../store/reducers/paginatedById";
import {
  trackThirdPartyMessageAttachmentBadFormat,
  trackThirdPartyMessageAttachmentDownloadFailed,
  trackThirdPartyMessageAttachmentUnavailable
} from "../analytics";
import { getHeaderByKey } from "../utils/strings";
import { handleRequestInit } from "./handleRequestInit";

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

const getDelayMilliseconds = (headers: Record<string, string>) =>
  pipe(
    getHeaderByKey(headers, "retry-after"),
    NumberFromString.decode,
    E.map(delay => delay * 1000),
    E.getOrElse(() => 0)
  );

function trackFailureEvent(
  skipMixpanelTrackingOnFailure: boolean,
  httpStatusCode: number,
  messageId: UIMessageId,
  serviceId: ServiceId | undefined
) {
  if (skipMixpanelTrackingOnFailure) {
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

export function* downloadAttachmentWorker(
  bearerToken: SessionToken,
  action: ActionType<typeof downloadAttachment.request>
): SagaIterator {
  const { skipMixpanelTrackingOnFailure, ...attachment } = action.payload;
  const messageId = attachment.messageId;
  const serviceId = yield* select(getServiceByMessageId, messageId);

  while (true) {
    try {
      const config = yield* call(ReactNativeBlobUtil.config, {
        path: savePath(attachment),
        timeout: fetchTimeout
      });

      const { method, attachmentFullUrl, headers } = yield* call(
        handleRequestInit,
        attachment,
        bearerToken,
        uuid()
      );

      const result = yield* call(
        config.fetch,
        method,
        attachmentFullUrl,
        headers
      );

      const { status, ...rest } = result.info();

      if (status === 200) {
        const path = result.path();
        yield* put(downloadAttachment.success({ attachment, path }));
      } else if (status === 503) {
        const waitingMs = getDelayMilliseconds(rest.headers);
        if (waitingMs >= 0) {
          yield* delay(waitingMs);
          continue;
        }
        throw Error(`response status ${status} without retry-after header`);
      } else {
        trackFailureEvent(
          skipMixpanelTrackingOnFailure,
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
      }
    } catch (error) {
      trackFailureEvent(
        skipMixpanelTrackingOnFailure,
        0,
        attachment.messageId,
        serviceId
      );
      yield* put(
        downloadAttachment.failure({
          attachment,
          error: getError(error)
        })
      );
    } finally {
      // In this way, the download pot's status
      // in the reducer will be properly updated.
      if (yield* cancelled()) {
        yield* put(downloadAttachment.cancel(attachment));
      }
    }
    break;
  }
}

/**
 * Handles the download of an attachment
 * @param bearerToken
 * @param action
 */
export function* handleDownloadAttachment(
  bearerToken: SessionToken,
  action: ActionType<typeof downloadAttachment.request>
) {
  // cancelPreviousAttachmentDownload is required in order to
  // cancel any previous download that was going on (since the
  // cancelling can either be triggered by requesting a different
  // download - where we do not know if there was a previous download
  // and/or which one it is, on PN attachments - or manually by the
  // user on generic attachments).
  yield* race({
    polling: call(downloadAttachmentWorker, bearerToken, action),
    cancelAction: take(cancelPreviousAttachmentDownload)
  });
}
