import { CreatedMessageWithContent } from "@io-app/api-types/generated/definitions/communication/CreatedMessageWithContent";
import { CreatedMessageWithContentAndAttachments } from "@io-app/api-types/generated/definitions/communication/CreatedMessageWithContentAndAttachments";
import { CreatedMessageWithContentAndEnrichedData } from "@io-app/api-types/generated/definitions/communication/CreatedMessageWithContentAndEnrichedData";
import { HasPreconditionEnum } from "@io-app/api-types/generated/definitions/communication/HasPrecondition";
import { MessageCategory } from "@io-app/api-types/generated/definitions/communication/MessageCategory";
import { TagEnum as TagEnumBase } from "@io-app/api-types/generated/definitions/communication/MessageCategoryBase";
import { TagEnum as TagEnumPayment } from "@io-app/api-types/generated/definitions/communication/MessageCategoryPayment";
import {
  MessageCategoryPN,
  TagEnum as TagEnumPN
} from "@io-app/api-types/generated/definitions/communication/MessageCategoryPN";
import { PublicMessage } from "@io-app/api-types/generated/definitions/communication/PublicMessage";
import { ThirdPartyAttachment } from "@io-app/api-types/generated/definitions/communication/ThirdPartyAttachment";
import { ThirdPartyMessageWithContent } from "@io-app/api-types/generated/definitions/communication/ThirdPartyMessageWithContent";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import * as B from "fp-ts/lib/boolean";
import { Either, isLeft, isRight, left, right } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { IncomingHttpHeaders } from "node:http";
import path from "path";
import { ParsedQs } from "qs";
import { __, match, not } from "ts-pattern";

import { ioDevServerConfig } from "../../../config";
import { getProblemJson } from "../../../payloads/error";
import { IoDevServerConfig } from "../../../types/config";
import { GetMessagesParameters } from "../../../types/parameters";
import { unknownToString } from "../../../utils/error";
import { ExpressFailure } from "../../../utils/expressDTO";
import { fileExists, isPDFFile } from "../../../utils/file";
import { rptIdFromServiceAndPaymentData } from "../../../utils/payment";
import { APIKey } from "../../pn/models/APIKey";
import {
  generateDocumentPath,
  generatePaymentDocumentPath
} from "../../pn/routers/documentsRouter";
import { sendServiceId } from "../../pn/services/dataService";
import ServicesDB from "../../services/persistence/servicesDatabase";
import { nextMessageIdAndCreationDate } from "../utils";

const getMessageCategory = (
  message: CreatedMessageWithContent
): MessageCategory => {
  if ("category" in message) {
    const messageCategoryEither = MessageCategory.decode(message.category);
    if (isRight(messageCategoryEither)) {
      const messageCategory = messageCategoryEither.right;
      if (messageCategory.tag === "PN") {
        return {
          id: messageCategory.id,
          tag: messageCategory.tag
        };
      }
      return messageCategoryEither.right;
    }
  }
  const { eu_covid_cert, payment_data } = message.content;
  const serviceId = message.sender_service_id;
  const senderService = ServicesDB.getService(serviceId);
  if (!senderService) {
    throw Error(
      `message.getCategory: unabled to find service with id (${serviceId})`
    );
  }
  if (
    ThirdPartyMessageWithContent.is(message) &&
    senderService.id === sendServiceId
  ) {
    return {
      tag: TagEnumPN.PN,
      original_sender: message.third_party_message.details?.senderDenomination,
      id: message.third_party_message.details?.iun,
      original_receipt_date: message.third_party_message.details?.sentAt,
      summary: message.third_party_message.details?.subject
    } as MessageCategoryPN;
  }
  if (eu_covid_cert?.auth_code) {
    return {
      tag: TagEnumBase.EU_COVID_CERT
    };
  }
  if (payment_data) {
    return {
      tag: TagEnumPayment.PAYMENT,
      rptId: rptIdFromServiceAndPaymentData(senderService, payment_data)
    };
  }
  return {
    tag: TagEnumBase.GENERIC
  };
};

/* helper function to build messages response */
const getPublicMessages = (
  messages: ReadonlyArray<CreatedMessageWithContentAndAttachments>,
  withEnrichedData: boolean,
  withContent: boolean,
  config: IoDevServerConfig
): ReadonlyArray<CreatedMessageWithContentAndAttachments | PublicMessage> =>
  messages.map(message => {
    const serviceId = message.sender_service_id;
    const senderService = ServicesDB.getService(serviceId);
    if (!senderService) {
      throw Error(
        `message.getPublicMessages: unabled to find service with id (${serviceId})`
      );
    }

    const enrichedData = pipe(
      withEnrichedData,
      B.fold(
        () => ({}),
        () => {
          const { content, is_read, is_archived, has_attachments } =
            message as CreatedMessageWithContentAndEnrichedData;

          return {
            service_name: senderService.name,
            organization_name: senderService.organization.name,
            organization_fiscal_code: senderService.organization.fiscal_code,
            message_title: content.subject,
            category: getMessageCategory(message),
            is_read,
            is_archived,
            has_attachments,
            has_precondition:
              message.content.third_party_data?.has_precondition ===
                HasPreconditionEnum.ALWAYS ||
              (message.content.third_party_data?.has_precondition ===
                HasPreconditionEnum.ONCE &&
                !is_read)
          };
        }
      )
    );

    const content = pipe(
      withContent,
      B.fold(
        () => ({}),
        () => ({
          content: message.content
        })
      )
    );

    return {
      id: message.id,
      fiscal_code: config.profile.attrs.fiscal_code,
      created_at: message.created_at,
      sender_service_id: message.sender_service_id,
      time_to_live: message.time_to_live,
      ...enrichedData,
      ...content
    };
  });

const computeGetMessagesQueryIndexes = (
  params: GetMessagesParameters,
  orderedList: ReadonlyArray<CreatedMessageWithContentAndAttachments>
) => {
  const toMatch = { maximumId: params.maximumId, minimumId: params.minimumId };
  return match(toMatch)
    .with({ maximumId: not(__.nullish), minimumId: not(__.nullish) }, () => {
      const endIndex = orderedList.findIndex(m => m.id === params.maximumId);
      const startIndex = orderedList.findIndex(m => m.id === params.minimumId);
      // if indexes are defined and in the expected order
      if (![endIndex, startIndex].includes(-1) && startIndex < endIndex) {
        return {
          startIndex: startIndex + 1,
          endIndex,
          backward: false
        };
      }
    })
    .with({ maximumId: not(__.nullish) }, () => {
      const startIndex = orderedList.findIndex(m => m.id === params.maximumId);
      // index is defined and not at the end of the list
      if (startIndex !== -1 && startIndex + 1 < orderedList.length) {
        const pageSize = params.pageSize;
        if (!pageSize) {
          throw new Error("Missing parameter 'pageSize' in request");
        }
        return {
          startIndex: startIndex + 1,
          endIndex: startIndex + 1 + pageSize,
          backward: false
        };
      }
    })
    .with({ minimumId: not(__.nullish) }, () => {
      const endIndex = orderedList.findIndex(m => m.id === params.minimumId);
      // index found and it isn't the first item (can't go back)
      if (endIndex > 0) {
        const pageSize = params.pageSize;
        if (!pageSize) {
          throw new Error("Missing parameter 'pageSize' in request");
        }
        return {
          startIndex: Math.max(0, endIndex - (1 + pageSize)),
          endIndex,
          backward: true
        };
      }
    })
    .otherwise(() => ({
      startIndex: 0,
      endIndex: params.pageSize as number,
      backward: false
    }));
};

const createMessage = () =>
  pipe(
    ServicesDB.getLocalServices(),
    localServices =>
      pipe(
        localServices.length,
        length => Math.min(Math.floor(Math.random() * length), length - 1),
        randomServiceIndex => localServices[randomServiceIndex]
      ),
    localService =>
      pipe(
        nextMessageIdAndCreationDate(),
        ({ id, created_at }) =>
          ({
            id,
            fiscal_code: ioDevServerConfig.profile.attrs.fiscal_code,
            created_at,
            content: {
              subject: `Created on ${new Date().toTimeString()}`,
              markdown: `Message content that was created on ${new Date().toTimeString()}\n\nJust some more content to make sure that it has a viable length`
            },
            sender_service_id: localService.id
          }) as CreatedMessageWithContentAndAttachments
      )
  );

const verifyAttachment = (
  message: CreatedMessageWithContentAndAttachments,
  attachmentUrl: string
): Either<ExpressFailure, ThirdPartyAttachment> => {
  const thirdPartyMessageWithContentEither =
    ThirdPartyMessageWithContent.decode(message);
  if (isLeft(thirdPartyMessageWithContentEither)) {
    return left({
      httpStatusCode: 500,
      reason: getProblemJson(
        500,
        "ThirdPartMessageWithContent decode failed",
        `Unable to decode from Message to ThirdPartMessageWithContent (${
          message.id
        } (${readableReportSimplified(
          thirdPartyMessageWithContentEither.left
        )}))`
      )
    });
  }
  const attachments =
    thirdPartyMessageWithContentEither.right.third_party_message.attachments;
  const attachment = attachments?.find(attachment =>
    attachment.url.endsWith(attachmentUrl)
  );
  if (attachment == null) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Attachment not found",
        `Unable to find attachment for message with id (${message.id}) (${attachmentUrl})`
      )
    });
  }
  const attachmentAbsolutePath = path.join(path.resolve("."), attachment.url);
  if (!fileExists(attachmentAbsolutePath)) {
    return left({
      httpStatusCode: 500,
      reason: getProblemJson(
        500,
        "Attachment file not found",
        `Attachment file does not exist (${attachmentAbsolutePath})`
      )
    });
  }
  const isPDFFileEither = isPDFFile(attachmentAbsolutePath);
  if (isLeft(isPDFFileEither)) {
    return left({
      httpStatusCode: 500,
      reason: getProblemJson(
        500,
        "Unable to verify PDF format",
        `Unable to check if requested attachment is a PDF file (${attachmentAbsolutePath}) (${isPDFFileEither.left})`
      )
    });
  }
  if (!isPDFFileEither.right) {
    return left({
      httpStatusCode: 415,
      reason: getProblemJson(
        415,
        "PDF check failed",
        `Attachment is not a PDF file (${attachmentAbsolutePath})`
      )
    });
  }

  return right(attachment);
};

const lollipopClientHeadersFromHeaders = (
  headers: IncomingHttpHeaders
): Record<string, string> =>
  [
    "x-pagopa-lollipop-original-method",
    "x-pagopa-lollipop-original-url",
    "signature-input",
    "signature"
  ].reduce((accumulatedHeaders, headerName) => {
    const headerValue = headers[headerName];
    if (headerValue != null) {
      return {
        ...accumulatedHeaders,
        [headerName]: headerValue
      };
    }
    return accumulatedHeaders;
  }, {});

const generateFakeLollipopServerHeaders = (
  fiscalCode: string
): Record<string, string> => ({
  // (sha256-[A-Za-z0-9-_=]{1,44}) | (sha384-[A-Za-z0-9-_=]{1,66}) | (sha512-[A-Za-z0-9-_=]{1,88})
  "x-pagopa-lollipop-assertion-ref":
    "sha256-olqj0f6xO-LHyWM1sTOK-c17Qdi37g_MvefmdjMlZAg",
  // SAML | OIDC
  "x-pagopa-lollipop-assertion-type": "SAML",
  "x-pagopa-lollipop-auth-jwt":
    "eyJrdHkiOiJFQyIsInkiOiJPa01mUXpTTE9iQ24xcjZlYm1nQUFYemIxbkRpSlozV0VwdEVEQ1JUaVNrPSIsImNydiI6IlAtMjU2IiwieCI6IlQ2dDBTSWJCd0pBdy9ON2N4ZjhldTdEYlJmbTQyZkZCL0pGVjBCcjVYSGs9In0=",
  //  Base64url encode of a JWK Public Key
  "x-pagopa-lollipop-public-key":
    "e2t0eToiRUMiLHk6Ik9rTWZRelNMT2JDbjFyNmVibWdBQVh6YjFuRGlKWjNXRXB0RURDUlRpU2s9IixjcnY6IlAtMjU2Iix4OiJUNnQwU0liQndKQXcvTjdjeGY4ZXU3RGJSZm00MmZGQi9KRlYwQnI1WEhrPSJ9",
  "x-pagopa-lollipop-user-id": fiscalCode
});

const sendAPIKeyHeader = (): Record<string, string> => ({
  "x-api-key": APIKey
});

const sendTaxIdHeader = (fiscalCode: string): Record<string, string> => ({
  "x-pagopa-cx-taxid": fiscalCode
});

// 'DEFAULT' is not a values that's sent in production. It is here
// just to be able to differentiate and log a warning if the header
// is not provided
const sendDefaultIOSourceHeader = (): Record<
  "x-pagopa-pn-io-src",
  "DEFAULT"
> => ({
  "x-pagopa-pn-io-src": "DEFAULT"
});

const checkAndBuildSENDAttachmentEndpoint = (
  attachmentUrl: string,
  mandateId?: string
): Either<ExpressFailure, string> => {
  const documentPattern =
    /^delivery\/notifications\/received\/([A-Za-z0-9_-]+)\/attachments\/documents\/([A-Za-z0-9_-]+)$/i;
  const documentMatch = attachmentUrl.match(documentPattern);
  if (documentMatch) {
    const iun = documentMatch[1];
    const index = documentMatch[2];
    return right(generateDocumentPath(iun, index, mandateId));
  }

  const paymentDocumentPattern =
    /^delivery\/notifications\/received\/([A-Za-z0-9_-]+)\/attachments\/payment\/(pagopa|f24)\?attachmentIdx=([A-Za-z0-9_-]+)$/i;
  const paymentDocumentMatch = attachmentUrl.match(paymentDocumentPattern);
  if (paymentDocumentMatch) {
    const iun = paymentDocumentMatch[1];
    const category = stringCategoryToPaymentDocumentCategory(
      paymentDocumentMatch[2]
    );
    if (category != null) {
      const index = paymentDocumentMatch[3];
      return right(
        generatePaymentDocumentPath(iun, index, category, mandateId)
      );
    }
  }

  return left({
    httpStatusCode: 400,
    reason: getProblemJson(
      400,
      "Invalid attachment URL",
      `Provided attachment URL in path parameter is not a valid SEND attachment url (${attachmentUrl})`
    )
  });
};

const stringCategoryToPaymentDocumentCategory = (
  category: string
): "F24" | "PAGOPA" | undefined => {
  if (category.toUpperCase() === "PAGOPA") {
    return "PAGOPA";
  } else if (category.toUpperCase() === "F24") {
    return "F24";
  }
  return undefined;
};

const appendAttachmentIdxToAttachmentUrlIfNeeded = (
  attachmentUrlPath: string,
  query: ParsedQs
) => {
  const { attachmentIdx } = query;
  const queryString =
    attachmentIdx != null ? `?attachmentIdx=${attachmentIdx}` : "";
  return `${attachmentUrlPath}${queryString}`;
};

const urlAttachmentFromUrlEncodedBase64UrlIfNeeded = (
  urlEncodedBase64Url: string
): Either<ExpressFailure, string> => {
  try {
    const base64Url = decodeURIComponent(urlEncodedBase64Url);
    const base64UrlBuffer = Buffer.from(base64Url, "base64");
    const url = base64UrlBuffer.toString("utf8");
    return right(url);
  } catch (e) {
    const reason = unknownToString(e);
    const expressFailure: ExpressFailure = {
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Bad path parameter",
        `Unable to decode url-encoded-base-64 attachment url (${reason})`
      )
    };
    return left(expressFailure);
  }
};

export default {
  appendAttachmentIdxToAttachmentUrlIfNeeded,
  checkAndBuildSENDAttachmentEndpoint,
  computeGetMessagesQueryIndexes,
  createMessage,
  generateFakeLollipopServerHeaders,
  getMessageCategory,
  getPublicMessages,
  lollipopClientHeadersFromHeaders,
  sendAPIKeyHeader,
  sendDefaultIOSourceHeader,
  sendTaxIdHeader,
  urlAttachmentFromUrlEncodedBase64UrlIfNeeded,
  verifyAttachment
};
