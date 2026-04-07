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
import I18n from "i18next";
import { ReduxSagaEffect } from "../../../types/utils";
import { fetchTimeout } from "../../../config";
import { getError } from "../../../utils/errors";
import { isTestEnv } from "../../../utils/environment";
import {
  cancelPreviousAttachmentDownload,
  downloadAttachment
} from "../store/actions";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import {
  trackThirdPartyMessageAttachmentBadFormat,
  trackThirdPartyMessageAttachmentDownloadFailed,
  trackThirdPartyMessageAttachmentUnavailable,
  trackUndefinedBearerToken,
  UndefinedBearerTokenPhase
} from "../analytics";
import { thirdPartyMessageSelector } from "../store/reducers/thirdPartyById";
import { KeyInfo } from "../../lollipop/utils/crypto";
import {
  attachmentDisplayName,
  getHeaderValueByKey,
  pdfSavePath,
  restrainRetryAfterIntervalInMilliseconds
} from "../utils/attachments";
import { isEphemeralAARThirdPartyMessage } from "../utils/thirdPartyById";
import { downloadAARAttachmentSaga } from "../../pn/aar/saga/downloadAARAttachmentSaga";
import { sessionTokenSelector } from "../../authentication/common/store/selectors";
import { getKeyInfo } from "../../lollipop/saga";
import { handleRequestInit } from "./handleRequestInit";

/**
 * Handles the download of an attachment
 * @param bearerToken
 * @param action
 */
export function* handleDownloadAttachment(
  action: ActionType<typeof downloadAttachment.request>
): Generator<ReduxSagaEffect, void> {
  const sessionToken = yield* select(sessionTokenSelector);
  const keyInfo = yield* call(getKeyInfo);

  if (!sessionToken) {
    trackUndefinedBearerToken(UndefinedBearerTokenPhase.attachmentDownload);
    return;
  }

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
      ? call(
          downloadAARAttachmentSaga,
          sessionToken,
          keyInfo,
          mandateId,
          action
        )
      : call(downloadAttachmentWorker, sessionToken, keyInfo, action),
    cancelAction: take(cancelPreviousAttachmentDownload)
  });
}

function* computeThirdPartyMessageData(messageId: string): Generator<
  ReduxSagaEffect,
  {
    ephemeralAARThirdPartyMessage: boolean;
    mandateId: string | undefined;
  }
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

function* downloadAttachmentWorker(
  bearerToken: string,
  keyInfo: KeyInfo,
  action: ActionType<typeof downloadAttachment.request>
): Generator<ReduxSagaEffect, void> {
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

const getDelayMilliseconds = (headers: Record<string, string>): number => {
  const retryAfterSecondsString = getHeaderValueByKey(headers, "retry-after");
  if (retryAfterSecondsString == null) {
    return 0;
  }
  const retryAfterSeconds = parseInt(retryAfterSecondsString, 10);
  if (!Number.isInteger(retryAfterSeconds) || retryAfterSeconds <= 0) {
    return 0;
  }

  // This check avoids a backend switch from seconds to
  // milliseconds that will cause the app to get stuck
  return restrainRetryAfterIntervalInMilliseconds(retryAfterSeconds);
};

const trackFailureEvent = (
  skipMixpanelTrackingOnFailure: boolean,
  httpStatusCode: number,
  messageId: string,
  serviceId: ServiceId | undefined
): void => {
  if (skipMixpanelTrackingOnFailure) {
    return;
  }
  if (httpStatusCode === 500) {
    trackThirdPartyMessageAttachmentUnavailable(messageId, serviceId);
  } else if (httpStatusCode === 415) {
    trackThirdPartyMessageAttachmentBadFormat(messageId, serviceId);
  } else if (httpStatusCode < 200 || httpStatusCode >= 400) {
    trackThirdPartyMessageAttachmentDownloadFailed(messageId, serviceId);
  }
};

export const testable = isTestEnv
  ? {
      computeThirdPartyMessageData,
      downloadAttachmentWorker,
      getDelayMilliseconds,
      trackFailureEvent
    }
  : undefined;
