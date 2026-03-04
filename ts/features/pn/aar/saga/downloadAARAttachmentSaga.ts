import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { isLeft } from "fp-ts/lib/Either";
import ReactNativeBlobUtil from "react-native-blob-util";
import { call, cancelled, delay, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { apiUrlPrefix, fetchTimeout } from "../../../../config";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../../types/utils";
import { isTestEnv } from "../../../../utils/environment";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { KeyInfo } from "../../../lollipop/utils/crypto";
import { downloadAttachment } from "../../../messages/store/actions";
import { unknownToReason } from "../../../messages/utils";
import {
  attachmentDisplayName,
  pdfSavePath,
  restrainRetryAfterIntervalInMilliseconds
} from "../../../messages/utils/attachments";
import {
  aarProblemJsonAnalyticsReport,
  trackSendAARFailure
} from "../analytics";
import { createSendAARClientWithLollipop } from "../api/client";
import { isAarAttachmentTtlError } from "../utils/aarErrorMappings";

const fastLoginType = "FAST_LOGIN_EXPIRED";
const fastLoginError = Error(fastLoginType);
const isFastLoginError = (e: unknown) =>
  e instanceof Error && e.message === fastLoginType;

export function* downloadAARAttachmentSaga(
  bearerToken: string,
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
    if (isFastLoginError(e)) {
      yield* call(
        trackSendAARFailure,
        "Download Attachment",
        "Fast login expired"
      );
    } else {
      yield* call(trackSendAARFailure, "Download Attachment", reason);
    }

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
  bearerToken: string,
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
  bearerToken: string,
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
    "x-pagopa-pn-io-src": "QR_CODE",
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

  const { status, value } = responseEither.right;
  if (status === 401) {
    throw fastLoginError;
  }
  if (status === 500) {
    const errorCode = value.errors?.[0]?.code;
    if (isAarAttachmentTtlError(errorCode)) {
      throw Error(errorCode);
    }
  }
  if (status !== 200) {
    const reason = aarProblemJsonAnalyticsReport(status, value);
    throw Error(`HTTP request failed (${reason})`);
  }

  const { retryAfter, url } = value;
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
