/* eslint-disable no-console */
import { call } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { isRight } from "fp-ts/lib/Either";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { SendAARClient } from "../api/client";
import { SagaCallReturnType } from "../../../../types/utils";
import { setAarFlowState } from "../store/actions";
import { unknownToReason } from "../../../messages/utils";

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

export function* exampleGetAttachmentMetadataSaga(
  getAttachmentMetadataFactory: SendAARClient["getNotificationAttachment"],
  bearerToken: string,
  action: ActionType<typeof setAarFlowState>
) {
  // ATTACHMENT
  // const unsafeAttachmentUrl =
  //  "/delivery/notifications/received/0000000000000000000002SEND/attachments/documents/0";
  // F24
  const unsafeAttachmentUrl =
    "/delivery/notifications/received/0000000000000000000002SEND/attachments/payment/F24?attachmentIdx=0";
  const urlEncodedBase64AttachmentUrl =
    encodeAttachmentUrl(unsafeAttachmentUrl);

  const request = getAttachmentMetadataFactory({
    Bearer: `Bearer ${bearerToken}`,
    urlEncodedBase64AttachmentUrl,
    "x-pagopa-pn-io-src": "QRCODE",
    mandateId: undefined,
    isTest: true
  });

  try {
    const responseEither = (yield* call(
      withRefreshApiCall,
      request,
      action
    )) as SagaCallReturnType<typeof getAttachmentMetadataFactory>;
    if (isRight(responseEither)) {
      const response = responseEither.right;
      if (response.status === 200) {
        const {
          contentLength,
          contentType,
          filename,
          sha256,
          retryAfter,
          url
        } = response.value;
        // TODO dispatch success
        console.log(
          `${contentLength}, ${contentType}, ${filename}, ${sha256}, ${retryAfter}, ${url}`
        );
      } else {
        const problemJson = response.value;
        throw Error(
          `${response.status} ${problemJson.status} ${problemJson.title} ${problemJson.detail} ${problemJson.type}  ${problemJson.instance}`
        );
      }
    } else {
      const reason = readableReportSimplified(responseEither.left);
      throw Error(reason);
    }
  } catch (e) {
    const reason = unknownToReason(e);
    // TODO dispatch failure
    // TODO mixpanel track
    console.log(reason);
  }
}
