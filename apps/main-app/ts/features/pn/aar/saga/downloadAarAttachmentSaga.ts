import { ThirdPartyAttachment } from "@io-app/api-types/generated/definitions/communication/ThirdPartyAttachment";
import { AARProblemJson } from "@io-app/api-types/generated/definitions/pn/aar/AARProblemJson";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { isLeft } from "fp-ts/lib/Either";
import ReactNativeBlobUtil from "react-native-blob-util";
import { call, cancelled, delay, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import { apiUrlPrefix, fetchTimeout } from "../../../../config";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../../types/utils";
import { isTestEnv } from "../../../../utils/environment";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { KeyInfo } from "../../../lollipop/utils/crypto";
import { downloadAttachment } from "../../../messages/store/actions";
import {
  decodeSendFailureReason,
  SendFailureReason,
  unknownToReason,
  WrappedSendError
} from "../../../messages/utils";
import {
  attachmentDisplayName,
  pdfSavePath,
  restrainRetryAfterIntervalInMilliseconds
} from "../../../messages/utils/attachments";
import {
  aarProblemJsonAnalyticsReport,
  trackSendAarFailure,
  trackSendAarNotificationDetailTtlError
} from "../analytics";
import { createSendAarClientWithLollipop } from "../api/client";
import { isAarAttachmentTtlError } from "../utils/aarErrorMappings";
import { SendAarFailurePhase } from "../utils/stateUtils";
class SendServerError extends Error {
  public readonly aarProblemJson: AARProblemJson;
  public readonly status: number;
  constructor(message: string, aarProblemJson: AARProblemJson, status: number) {
    super(message);

    this.name = "SendServerError";
    this.aarProblemJson = aarProblemJson;
    this.status = status;
  }
}

const sendAarFailurePhase: SendAarFailurePhase = "Download Attachment";
const fastLoginType = "FAST_LOGIN_EXPIRED";
const fastLoginError = Error(fastLoginType);
const isFastLoginError = (e: unknown) =>
  e instanceof Error && e.message === fastLoginType;

export function* downloadAarAttachmentSaga(
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
    const isFastLogin = isFastLoginError(e);
    if (isFastLogin) {
      yield* call(
        trackSendAarFailure,
        sendAarFailurePhase,
        "Fast login expiration",
        undefined
      );
    } else {
      const problemJson =
        e instanceof SendServerError ? e.aarProblemJson : undefined;
      yield* call(
        trackSendAarFailure,
        sendAarFailurePhase,
        reason,
        problemJson
      );
    }

    const apiFailureReason = isFastLogin
      ? SendFailureReason.SESSION_EXPIRED
      : e instanceof SendServerError
        ? decodeSendFailureReason({ kind: "http_status", status: e.status })
        : e instanceof WrappedSendError
          ? e.reason
          : decodeSendFailureReason({ kind: "caught", error: e });

    yield* put(
      downloadAttachment.failure({
        attachment,
        messageId,
        error: new WrappedSendError(apiFailureReason, reason)
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

function* getAttachmentMetadata(
  bearerToken: string,
  keyInfo: KeyInfo,
  attachmentUrl: string,
  useUATEnvironment: boolean,
  mandateId: string | undefined,
  action: ActionType<typeof downloadAttachment.request>
): Generator<ReduxSagaEffect, number | string> {
  const sendAarClient = createSendAarClientWithLollipop(apiUrlPrefix, keyInfo);
  const getAttachmentMetadataFactory = sendAarClient.getNotificationAttachment;

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
    throw new WrappedSendError(
      SendFailureReason.DECODE_ERROR,
      `Decoding failure (${reason})`
    );
  }

  const { status, value } = responseEither.right;
  if (status === 401) {
    throw fastLoginError;
  }
  if (status === 500) {
    const errorCode = value.errors?.[0]?.code;
    if (isAarAttachmentTtlError(errorCode)) {
      yield* call(trackSendAarNotificationDetailTtlError);
      throw new SendServerError(errorCode, value, status);
    }
  }
  if (status !== 200) {
    const reason = aarProblemJsonAnalyticsReport(status, value);
    throw new SendServerError(reason, value, status);
  }

  const { retryAfter, url } = value;
  if (url != null && url.trim().length > 0) {
    return url;
  } else if (retryAfter != null) {
    return retryAfter;
  }
  throw new WrappedSendError(
    SendFailureReason.MALFORMED_RESPONSE,
    `Both 'retryAfter' and 'url' fields are missing or invalid (${retryAfter}) (${url})`
  );
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
  throw new WrappedSendError(
    decodeSendFailureReason({ kind: "http_status", status }),
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
      getAttachmentPrevalidatedUrl,
      SendServerError
    }
  : undefined;
