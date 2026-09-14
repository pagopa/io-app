import { Request, Response, Router } from "express";

import { ioDevServerConfig } from "../../../config";
import { addHandler } from "../../../payloads/response";
import { handleLeftEitherIfNeeded } from "../../../utils/error";
import { authenticationMiddleware } from "../middlewares/authenticationMiddleware";
import { initializationMiddleware } from "../middlewares/initializationMiddleware";
import { DocumentCategory } from "../models/Document";
import {
  checkAndValidateLollipopAndTaxId,
  checkSourceHeaderNonBlocking,
  mandateIdFromQuery
} from "../services/commonService";
import {
  checkAndValidateAttachmentIndex,
  checkAndValidateAttachmentName,
  notificationAttachmentDownloadMetadataResponseForAttachment
} from "../services/documentsService";
import { checkAndVerifyExistingMandate } from "../services/mandateService";
import { notificationFromIUN } from "../services/notificationsService";

const documentPath =
  "/delivery/notifications/received/:iun/attachments/documents/:docIdx";
const paymentDocumentPath =
  "/delivery/notifications/received/:iun/attachments/payment/:attachmentName";

export const generateDocumentPath = (
  iun: string,
  index: string,
  mandateId?: string
) => {
  const path = documentPath
    .replace(":iun", iun)
    .replace(":docIdx", index.toString());
  if (mandateId == null || mandateId.trim().length === 0) {
    return path;
  }
  return `${path}?mandateId=${mandateId}`;
};
export const generatePaymentDocumentPath = (
  iun: string,
  index: string,
  category: Extract<DocumentCategory, "F24" | "PAGOPA">,
  mandateId?: string
) => {
  const path = `${paymentDocumentPath
    .replace(":iun", iun)
    .replace(":attachmentName", category)}?attachmentIdx=${index}`;
  if (mandateId == null || mandateId.trim().length === 0) {
    return path;
  }
  return `${path}&mandateId=${mandateId}`;
};

export const sendDocumentsRouter = Router();

addHandler(
  sendDocumentsRouter,
  "get",
  documentPath,
  // Middleware have to be used like this (instead of directly giving the middleware to the router via use)
  // because supertest (when testing) calls every middleware upon test initialization, even if it not in a
  // router directly called by the test, thus making every test fail due to the authentication middleware
  authenticationMiddleware(
    initializationMiddleware((req: Request, res: Response) => {
      const taxIdEither = checkAndValidateLollipopAndTaxId(
        ioDevServerConfig.send,
        req
      );
      if (handleLeftEitherIfNeeded(taxIdEither, res)) {
        return;
      }
      const requestIUN = req.params.iun;
      const notificationEither = notificationFromIUN(requestIUN);
      if (handleLeftEitherIfNeeded(notificationEither, res)) {
        return;
      }
      checkSourceHeaderNonBlocking(req.headers);
      const { notification } = notificationEither.right;
      if (notification.recipientFiscalCode !== taxIdEither.right) {
        const mandateId = mandateIdFromQuery(req);
        const mandateEither = checkAndVerifyExistingMandate(
          notification.iun,
          mandateId,
          taxIdEither.right
        );
        if (handleLeftEitherIfNeeded(mandateEither, res)) {
          return;
        }
      }
      const docIdxEither = checkAndValidateAttachmentIndex(
        "DOCUMENT",
        notification,
        req
      );
      if (handleLeftEitherIfNeeded(docIdxEither, res)) {
        return;
      }
      const docIdx = docIdxEither.right;
      const notificationAttachmentDownloadMetadataResponseEither =
        notificationAttachmentDownloadMetadataResponseForAttachment(
          docIdx,
          "DOCUMENT"
        );
      if (
        handleLeftEitherIfNeeded(
          notificationAttachmentDownloadMetadataResponseEither,
          res
        )
      ) {
        return;
      }
      res
        .status(200)
        .json(notificationAttachmentDownloadMetadataResponseEither.right);
    })
  ),
  () => 500 + 1000 * Math.random()
);

addHandler(
  sendDocumentsRouter,
  "get",
  paymentDocumentPath,
  // Middleware have to be used like this (instead of directly giving the middleware to the router via use)
  // because supertest (when testing) calls every middleware upon test initialization, even if it not in a
  // router directly called by the test, thus making every test fail due to the authentication middleware
  authenticationMiddleware(
    initializationMiddleware((req: Request, res: Response) => {
      const taxIdEither = checkAndValidateLollipopAndTaxId(
        ioDevServerConfig.send,
        req
      );
      if (handleLeftEitherIfNeeded(taxIdEither, res)) {
        return;
      }
      const requestIUN = req.params.iun;
      const notificationEither = notificationFromIUN(requestIUN);
      if (handleLeftEitherIfNeeded(notificationEither, res)) {
        return;
      }
      checkSourceHeaderNonBlocking(req.headers);
      const { notification } = notificationEither.right;
      if (notification.recipientFiscalCode !== taxIdEither.right) {
        const mandateId = mandateIdFromQuery(req);
        const mandateEither = checkAndVerifyExistingMandate(
          notification.iun,
          mandateId,
          taxIdEither.right
        );
        if (handleLeftEitherIfNeeded(mandateEither, res)) {
          return;
        }
      }
      const attachmentCategoryEither = checkAndValidateAttachmentName(req);
      if (handleLeftEitherIfNeeded(attachmentCategoryEither, res)) {
        return;
      }
      const attachmentIdxEither = checkAndValidateAttachmentIndex(
        attachmentCategoryEither.right,
        notification,
        req
      );
      if (handleLeftEitherIfNeeded(attachmentIdxEither, res)) {
        return;
      }
      const atachmentIdx = attachmentIdxEither.right;
      const notificationAttachmentDownloadMetadataResponseEither =
        notificationAttachmentDownloadMetadataResponseForAttachment(
          atachmentIdx,
          attachmentCategoryEither.right
        );
      if (
        handleLeftEitherIfNeeded(
          notificationAttachmentDownloadMetadataResponseEither,
          res
        )
      ) {
        return;
      }
      res
        .status(200)
        .json(notificationAttachmentDownloadMetadataResponseEither.right);
    })
  ),
  () => 500 + 1000 * Math.random()
);
