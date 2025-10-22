import { isLeft } from "fp-ts/lib/Either";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { call, cancelled, delay, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import ReactNativeBlobUtil from "react-native-blob-util";
import { SessionToken } from "../../../../types/SessionToken";
import { KeyInfo } from "../../../lollipop/utils/crypto";
import { createSendAARClientWithLollipop } from "../api/client";
import { apiUrlPrefix, fetchTimeout } from "../../../../config";
import { downloadAttachment } from "../../../messages/store/actions";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../../types/utils";
import { unknownToReason } from "../../../messages/utils";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import {
  attachmentDisplayName,
  pdfSavePath,
  restrainRetryAfterIntervalInMilliseconds
} from "../../../messages/utils/attachments";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import {
  aarProblemJsonAnalyticsReport,
  trackSendAARFailure
} from "../analytics";
import { isTestEnv } from "../../../../utils/environment";

export function* downloadAARAttachmentSaga(
  bearerToken: SessionToken,
  keyInfo: KeyInfo,
  mandateId: string | undefined,
  action: ActionType<typeof downloadAttachment.request>
) {
  const { attachment, messageId } = action.payload;

  const useSendUATEnvironment = yield* select(isPnTestEnabledSelector);

  try {
    const attachmentPrevalidatedUrl = yield* call(
      getAttachmentPrevalidatedUrl,
      bearerToken,
      keyInfo,
      attachment.url,
      useSendUATEnvironment,
      mandateId,
      action
    );

    const attachmentDownloadPath = yield* call(
      downloadAttachmentFromPrevalidatedUrl,
      attachment,
      messageId,
      attachmentPrevalidatedUrl
    );

    yield* put(
      downloadAttachment.success({
        attachment,
        messageId,
        path: attachmentDownloadPath
      })
    );
  } catch (e) {
    const reason = unknownToReason(e);
    yield* call(trackSendAARFailure, "Download Attachment", reason);
    yield* put(
      downloadAttachment.failure({
        attachment,
        messageId,
        error: Error(reason)
      })
    );
  } finally {
    // In this way, the download pot's status
    // in the reducer will be properly updated.
    if (yield* cancelled()) {
      yield* put(downloadAttachment.cancel({ attachment, messageId }));
    }
  }
}

function* getAttachmentPrevalidatedUrl(
  bearerToken: SessionToken,
  keyInfo: KeyInfo,
  attachmentUrl: string,
  useUATEnvironment: boolean,
  mandateId: string | undefined,
  action: ActionType<typeof downloadAttachment.request>
): Generator<ReduxSagaEffect, string> {
  while (true) {
    const attachmentMetadataRetryAfterOrUrl = yield* call(
      getAttachmentMetadata,
      bearerToken,
      keyInfo,
      attachmentUrl,
      useUATEnvironment,
      mandateId,
      action
    );
    if (typeof attachmentMetadataRetryAfterOrUrl === "string") {
      return attachmentMetadataRetryAfterOrUrl;
    }
    const retryAfterMilliseconds = yield* call(
      restrainRetryAfterIntervalInMilliseconds,
      attachmentMetadataRetryAfterOrUrl
    );
    yield* delay(retryAfterMilliseconds);
  }
}

function* getAttachmentMetadata(
  bearerToken: SessionToken,
  keyInfo: KeyInfo,
  attachmentUrl: string,
  useUATEnvironment: boolean,
  mandateId: string | undefined,
  action: ActionType<typeof downloadAttachment.request>
): Generator<ReduxSagaEffect, string | number> {
  const sendAARClient = createSendAARClientWithLollipop(apiUrlPrefix, keyInfo);
  const getAttachmentMetadataFactory = sendAARClient.getNotificationAttachment;

  const urlEncodedBase64AttachmentUrl = encodeAttachmentUrl(attachmentUrl);

  const request = getAttachmentMetadataFactory({
    Bearer: `Bearer ${bearerToken}`,
    urlEncodedBase64AttachmentUrl,
    "x-pagopa-pn-io-src": "QRCODE",
    mandateId,
    isTest: useUATEnvironment
  });

  const responseEither = (yield* call(
    withRefreshApiCall,
    request,
    action
  )) as SagaCallReturnType<typeof getAttachmentMetadataFactory>;

  if (isLeft(responseEither)) {
    const reason = readableReportSimplified(responseEither.left);
    throw Error(`Decoding failure (${reason})`);
  }

  const response = responseEither.right;
  if (response.status !== 200) {
    const reason = aarProblemJsonAnalyticsReport(
      response.status,
      response.value
    );
    throw Error(`HTTP request failed (${reason})`);
  }

  const { retryAfter, url } = response.value;
  if (url != null && url.trim().length > 0) {
    return url;
  } else if (retryAfter != null) {
    return retryAfter;
  }
  throw Error(
    `Both 'retryAfter' and 'url' fields are missing or invalid (${retryAfter}) (${url})`
  );
}

const encodeAttachmentUrl = (inputAttachmentUrl: string): string => {
  const initialSlashRemovedInputAttachmentUrl = inputAttachmentUrl.startsWith(
    "/"
  )
    ? inputAttachmentUrl.substring(1)
    : inputAttachmentUrl;
  const initialSlashRemovedInputAttachmentUrlBuffer = Buffer.from(
    initialSlashRemovedInputAttachmentUrl,
    "utf8"
  );
  const initialSlashRemovedInputAttachmentUrlBase64 =
    initialSlashRemovedInputAttachmentUrlBuffer.toString("base64");
  return encodeURIComponent(initialSlashRemovedInputAttachmentUrlBase64);
};

function* downloadAttachmentFromPrevalidatedUrl(
  attachment: ThirdPartyAttachment,
  messageId: string,
  prevalidatedAttachmentUrl: string
): Generator<ReduxSagaEffect, string> {
  const attachmentId = attachment.id;
  const attachmentName = attachmentDisplayName(attachment);
  const config = yield* call(ReactNativeBlobUtil.config, {
    path: pdfSavePath(messageId, attachmentId, attachmentName),
    timeout: fetchTimeout
  });
  const result = yield* call(config.fetch, "get", prevalidatedAttachmentUrl);

  const { status, state, respType, timeout } = result.info();
  if (status === 200) {
    return result.path();
  }
  throw Error(
    `Download from prevalidated url failed: ${
      timeout ? "Timeout " : ""
    }${status} ${state} ${respType}`
  );
}

export const testable = isTestEnv
  ? {
      downloadAttachmentFromPrevalidatedUrl,
      encodeAttachmentUrl,
      getAttachmentMetadata,
      getAttachmentPrevalidatedUrl
    }
  : undefined;
