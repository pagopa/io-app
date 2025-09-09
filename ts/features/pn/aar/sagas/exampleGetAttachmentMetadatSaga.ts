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

const extractAttachmentUrl = (
  input: string
): {
  url: string;
  attachmentIdx?: string;
} => {
  const slashRemovedInput = input.startsWith("/") ? input.substring(1) : input;

  const regex = /attachmentIdx=([^\\s&]+)/i;

  const match = slashRemovedInput.match(regex);

  // If no match is found, return the original string and null.
  if (!match) {
    return { url: slashRemovedInput };
  }

  // The captured value, e.g., "12345"
  const value = match[1];
  // The full match, e.g., "attachmentIdx=12345"
  const keyValuePair = match[0];

  // Case: The parameter is the only one, preceded by '?'
  // e.g., "...?attachmentIdx=123"
  const withLeadingQuestion = `?${keyValuePair}`;
  const modifiedString = slashRemovedInput.replace(withLeadingQuestion, "");
  return { url: modifiedString, attachmentIdx: value };
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
  const { url: attachmentUrl, attachmentIdx } =
    extractAttachmentUrl(unsafeAttachmentUrl);

  const request = getAttachmentMetadataFactory({
    Bearer: `Bearer ${bearerToken}`,
    attachmentUrl,
    attachmentIdx,
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
