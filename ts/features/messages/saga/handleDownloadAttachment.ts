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
import ReactNativeBlobUtil from "react-native-blob-util";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import { NumberFromString } from "@pagopa/ts-commons/lib/numbers";
import I18n from "i18next";
import { ReduxSagaEffect } from "../../../types/utils";
import { fetchTimeout } from "../../../config";
import { SessionToken } from "../../../types/SessionToken";
import { getError } from "../../../utils/errors";
import {
  cancelPreviousAttachmentDownload,
  downloadAttachment
} from "../store/actions";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import {
  trackThirdPartyMessageAttachmentBadFormat,
  trackThirdPartyMessageAttachmentDownloadFailed,
  trackThirdPartyMessageAttachmentUnavailable
} from "../analytics";
import { getHeaderByKey } from "../utils/strings";
import {
  isEphemeralAARThirdPartyMessage,
  thirdPartyMessageSelector
} from "../store/reducers/thirdPartyById";
import { KeyInfo } from "../../lollipop/utils/crypto";
import { attachmentDisplayName, pdfSavePath } from "../utils/attachments";
import { downloadAARAttachmentSaga } from "../../pn/aar/saga/downloadAARAttachmentSaga";
import { handleRequestInit } from "./handleRequestInit";

const getDelayMilliseconds = (headers: Record<string, string>) =>
  pipe(
    getHeaderByKey(headers, "retry-after"),
    NumberFromString.decode,
    E.map(retryAfterSeconds => retryAfterSeconds * 1000),
    E.getOrElse(() => 0)
  );

function trackFailureEvent(
  skipMixpanelTrackingOnFailure: boolean,
  httpStatusCode: number,
  messageId: string,
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
  keyInfo: KeyInfo,
  action: ActionType<typeof downloadAttachment.request>
): SagaIterator {
  const { attachment, messageId, skipMixpanelTrackingOnFailure, serviceId } =
    action.payload;

  const name = attachmentDisplayName(attachment);

  while (true) {
    try {
      const config = yield* call(ReactNativeBlobUtil.config, {
        path: pdfSavePath(messageId, attachment.id, name),
        timeout: fetchTimeout
      });

      const { method, attachmentFullUrl, headers } = yield* call(
        handleRequestInit,
        attachment,
        messageId,
        bearerToken,
        keyInfo
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
        yield* put(downloadAttachment.success({ attachment, messageId, path }));
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
          messageId,
          serviceId
        );
        // In this case we produce a taking error that can be
        // shown directly to the user
        const errorKey =
          status === 415
            ? "messageDetails.attachments.badFormat"
            : "messageDetails.attachments.downloadFailed";
        const error = new Error(I18n.t(errorKey));
        yield* put(
          downloadAttachment.failure({ attachment, messageId, error })
        );
      }
    } catch (error) {
      trackFailureEvent(skipMixpanelTrackingOnFailure, 0, messageId, serviceId);
      yield* put(
        downloadAttachment.failure({
          attachment,
          messageId,
          error: getError(error)
        })
      );
    } finally {
      // In this way, the download pot's status
      // in the reducer will be properly updated.
      if (yield* cancelled()) {
        yield* put(downloadAttachment.cancel({ attachment, messageId }));
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
  keyInfo: KeyInfo,
  action: ActionType<typeof downloadAttachment.request>
) {
  const messageId = action.payload.messageId;
  const { ephemeralAARThirdPartyMessage, mandateId } = yield* call(
    computeThirdPartyMessageData,
    messageId
  );
  // cancelPreviousAttachmentDownload is required in order to
  // cancel any previous download that was going on (since the
  // cancelling can either be triggered by requesting a different
  // download - where we do not know if there was a previous download
  // and/or which one it is, on PN attachments - or manually by the
  // user on generic attachments).
  yield* race({
    polling: ephemeralAARThirdPartyMessage
      ? call(downloadAARAttachmentSaga, bearerToken, keyInfo, mandateId, action)
      : call(downloadAttachmentWorker, bearerToken, keyInfo, action),
    cancelAction: take(cancelPreviousAttachmentDownload)
  });
}

export function* computeThirdPartyMessageData(messageId: string): Generator<
  ReduxSagaEffect,
  {
    ephemeralAARThirdPartyMessage: boolean;
    mandateId: string | undefined;
  },
  ReturnType<typeof thirdPartyMessageSelector>
> {
  const thirdPartyMessage = yield* select(thirdPartyMessageSelector, messageId);
  if (
    thirdPartyMessage != null &&
    isEphemeralAARThirdPartyMessage(thirdPartyMessage)
  ) {
    return {
      ephemeralAARThirdPartyMessage: true,
      mandateId: thirdPartyMessage.mandateId
    };
  }
  return {
    ephemeralAARThirdPartyMessage: false,
    mandateId: undefined
  };
}
