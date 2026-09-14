import { NotificationAttachmentDownloadMetadataResponse } from "@io-app/api-types/generated/definitions/pn/NotificationAttachmentDownloadMetadataResponse";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { Request } from "express";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";

import { getProblemJson } from "../../../payloads/error";
import { ExpressFailure } from "../../../utils/expressDTO";
import { serverUrl } from "../../../utils/server";
import { Document, DocumentCategory } from "../models/Document";
import { Notification } from "../models/Notification";
import { DocumentsRepository } from "../repositories/documentRepository";
import { PrevalidatedUrisRepository } from "../repositories/prevalidatedUrisRepository";
import { generatePrevalidatedUriPath } from "../routers/prevalidatedUrisRouter";
import { generateUriForRelativePath } from "./prevalidatedUrisService";

export const checkAndValidateAttachmentName = (
  req: Request
): Either<ExpressFailure, Extract<DocumentCategory, "F24" | "PAGOPA">> => {
  const attachmentName = req.params.attachmentName;
  if (attachmentName == null) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        `Missing 'attachmentName' in path`,
        `No value found for path parameter 'attachmentName' (${attachmentName})`
      )
    });
  }

  const upperCaseAttachmentName = attachmentName.toUpperCase();
  if (
    upperCaseAttachmentName !== "F24" &&
    upperCaseAttachmentName !== "PAGOPA"
  ) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        `Bad value for 'attachmentName'`,
        `Value for path parameter 'attachmentName' is not valid (${attachmentName})`
      )
    });
  }
  return right(upperCaseAttachmentName);
};

export const checkAndValidateAttachmentIndex = (
  documentCategory: DocumentCategory,
  notification: Notification,
  req: Request
): Either<ExpressFailure, number> => {
  const isDocument = documentCategory === "DOCUMENT";
  const parameterName = isDocument ? "docIdx" : "attachmentIdx";
  const attachmentIndexString = isDocument
    ? req.params[parameterName]
    : req.query[parameterName];
  const attachmentIndex = Number(attachmentIndexString);
  if (Number.isNaN(attachmentIndex)) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        `Bad parameter '${parameterName}'`,
        `Missing or bad value for ${
          isDocument ? "path" : "query"
        } parameter '${parameterName}' (${attachmentIndexString})`
      )
    });
  }
  const attachment = notification.attachments?.find(
    attachment =>
      attachment.category === documentCategory &&
      attachment.index === attachmentIndex
  );
  if (attachment == null) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Attachment not found",
        `Notification with iun (${notification.iun}) does not have an attachment of type '${documentCategory}' and index ${attachmentIndex}`
      )
    });
  }
  return right(attachmentIndex);
};

export const notificationAttachmentDownloadMetadataResponseForAttachment = (
  index: number,
  category: DocumentCategory
): Either<ExpressFailure, NotificationAttachmentDownloadMetadataResponse> => {
  if (category === "DOCUMENT") {
    return notificationAttachmentDownloadMetadataResponseForDocument(index);
  }
  return notificationAttachmentDownloadMetadataResponseForPaymentDocument(
    index
  );
};

const notificationAttachmentDownloadMetadataResponseForDocument = (
  index: number
): Either<ExpressFailure, NotificationAttachmentDownloadMetadataResponse> => {
  const documentEither = DocumentsRepository.documentAtIndex(index);
  if (isLeft(documentEither)) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Document not found",
        `Document not found for index (${index})`
      )
    });
  }
  return documentToNotificationAttachmentDownloadMetadataResponse(
    documentEither.right,
    false
  );
};

const notificationAttachmentDownloadMetadataResponseForPaymentDocument = (
  index: number
): Either<ExpressFailure, NotificationAttachmentDownloadMetadataResponse> => {
  const paymentDocumentEither =
    DocumentsRepository.paymentDocumentAtIndex(index);
  if (isLeft(paymentDocumentEither)) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        `Payment Document not found`,
        `Payment Document not found for index (${index})`
      )
    });
  }
  const paymentDocument = paymentDocumentEither.right;

  const now = new Date();

  const isGeneratingPaymentDocument =
    paymentDocument.availableFrom == null ||
    now < paymentDocument.availableFrom;
  const isPaymentDocumentExpired =
    paymentDocument.availableUntil == null ||
    now > paymentDocument.availableUntil;

  const shouldUpdateAvailabilityRange =
    paymentDocument.availableFrom == null || isPaymentDocumentExpired;
  if (shouldUpdateAvailabilityRange) {
    const updatedF24Either =
      DocumentsRepository.updateAvailabilityRangeForPaymentDocumentAtIndex(
        index
      );
    if (isLeft(updatedF24Either)) {
      return left({
        httpStatusCode: 500,
        reason: getProblemJson(
          500,
          `Availability range update failed`,
          `Unable to updated availability range for Payment Document at index (${index})`
        )
      });
    }
  }

  if (isGeneratingPaymentDocument || isPaymentDocumentExpired) {
    return documentToNotificationAttachmentDownloadMetadataResponse(
      paymentDocument,
      true
    );
  }

  return documentToNotificationAttachmentDownloadMetadataResponse(
    paymentDocument,
    false
  );
};

const documentToNotificationAttachmentDownloadMetadataResponse = (
  document: Document,
  isRetryAfter: boolean
): Either<ExpressFailure, NotificationAttachmentDownloadMetadataResponse> => {
  const uri = generateUriForRelativePath(document.relativePath);
  const urlEncodedUri = encodeURIComponent(uri);
  const prevalidatedUriPath = generatePrevalidatedUriPath(urlEncodedUri);
  const url = `${serverUrl}${prevalidatedUriPath}`;

  const responseDocument = {
    contentLength: document.contentLength,
    contentType: document.contentType,
    filename: document.filename,
    retryAfter: isRetryAfter
      ? DocumentsRepository.getPaymentDocumentRetryAfterSeconds()
      : undefined,
    sha256: document.sha256,
    url: !isRetryAfter ? url : undefined
  };
  const notificationAttachmentDownloadMetadataResponseEither =
    NotificationAttachmentDownloadMetadataResponse.decode(responseDocument);
  if (isLeft(notificationAttachmentDownloadMetadataResponseEither)) {
    return left({
      httpStatusCode: 500,
      reason: getProblemJson(
        500,
        "Invalid data structure for NotificationAttachmentDownloadMetadataResponse",
        `Conversion from Document to NotificationAttachmentDownloadMetadataResponse produced ad invalid data structure (${readableReport(
          notificationAttachmentDownloadMetadataResponseEither.left
        )})`
      )
    });
  }

  if (!isRetryAfter) {
    PrevalidatedUrisRepository.setPrevalidatedUri(uri);
  }

  return notificationAttachmentDownloadMetadataResponseEither;
};
