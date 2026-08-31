/* eslint-disable functional/immutable-data */
import { createHash } from "crypto";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { readdirSync, readFileSync } from "fs";
import path from "path";
import { cwd } from "process";

import { unknownToString } from "../../../utils/error";
import { Document, DocumentCategory } from "../models/Document";
import { SendConfig } from "../types/sendConfig";

const defaultPaymentDocumentGenerationTimeSeconds = 5;
const defaultPaymentDocumentExpirationTimeSeconds = 10;
const defaultPaymentDocumentRetryAfterSeconds = 2;
const repositoryConfiguration = new Map<
  | "paymentDocumentExpirationTimeSeconds"
  | "paymentDocumentGenerationTimeSeconds"
  | "paymentDocumentRetryAfterSeconds",
  number
>();

const getPaymentDocumentGenerationTimeSeconds = () =>
  repositoryConfiguration.get("paymentDocumentGenerationTimeSeconds") ??
  defaultPaymentDocumentGenerationTimeSeconds;
const getPaymentDocumentExpirationTimeSeconds = () =>
  repositoryConfiguration.get("paymentDocumentExpirationTimeSeconds") ??
  defaultPaymentDocumentExpirationTimeSeconds;
const getPaymentDocumentRetryAfterSeconds = () =>
  repositoryConfiguration.get("paymentDocumentRetryAfterSeconds") ??
  defaultPaymentDocumentRetryAfterSeconds;

export interface IDocumentsRepository {
  documentAtIndex: (index: number) => Either<string, Document>;
  getPaymentDocumentRetryAfterSeconds: () => number;
  initializeIfNeeded: (configuration: SendConfig) => Either<string, boolean>;
  paymentDocumentAtIndex: (index: number) => Either<string, Document>;
  updateAvailabilityRangeForPaymentDocumentAtIndex: (
    index: number
  ) => Either<string, Document>;
}

const documents = new Array<Document>();
const paymentDocuments = new Array<Document>();

const documentAtIndex = (index: number): Either<string, Document> => {
  if (documents.length === 0) {
    return left("There are no documents");
  }
  const safeIndex = index % documents.length;
  return right(documents[safeIndex]);
};

const paymentDocumentAtIndex = (index: number): Either<string, Document> => {
  if (paymentDocuments.length === 0) {
    return left("There are no Payment Documents");
  }
  const safeIndex = index % paymentDocuments.length;
  return right(paymentDocuments[safeIndex]);
};

const updateAvailabilityRangeForPaymentDocumentAtIndex = (
  index: number
): Either<string, Document> => {
  const paymentDocumentEither = paymentDocumentAtIndex(index);
  if (isLeft(paymentDocumentEither)) {
    return paymentDocumentEither;
  }

  const availableFromDate = new Date();
  availableFromDate.setTime(
    availableFromDate.getTime() +
      1000 * getPaymentDocumentGenerationTimeSeconds()
  );

  const availableUntilDate = new Date();
  availableUntilDate.setTime(
    availableFromDate.getTime() +
      1000 * getPaymentDocumentExpirationTimeSeconds()
  );

  paymentDocumentEither.right.availableFrom = availableFromDate;
  paymentDocumentEither.right.availableUntil = availableUntilDate;

  return paymentDocumentEither;
};

const initializeIfNeeded = (
  configuration: SendConfig
): Either<string, boolean> => {
  const shouldInitializeDocuments = documents.length === 0;
  const shouldInitializePaymentDocuments = paymentDocuments.length === 0;
  const shouldInitializeConfiguration = repositoryConfiguration.size === 0;
  if (
    !shouldInitializeDocuments &&
    !shouldInitializePaymentDocuments &&
    !shouldInitializeConfiguration
  ) {
    return right(false);
  }

  if (shouldInitializeConfiguration) {
    repositoryConfiguration.set(
      "paymentDocumentExpirationTimeSeconds",
      configuration.paymentDocumentExpirationTimeSeconds ??
        defaultPaymentDocumentGenerationTimeSeconds
    );
    repositoryConfiguration.set(
      "paymentDocumentGenerationTimeSeconds",
      configuration.paymentDocumentGenerationTimeSeconds ??
        defaultPaymentDocumentExpirationTimeSeconds
    );
  }

  try {
    const currentWorkingDirectory = cwd();
    const baseRelativePath = path.join("assets", "messages", "pn");
    if (shouldInitializeDocuments) {
      populateDocumentsFromFolder(
        "DOCUMENT",
        currentWorkingDirectory,
        baseRelativePath,
        "attachments",
        documents
      );
    }
    if (shouldInitializePaymentDocuments) {
      populateDocumentsFromFolder(
        "F24",
        currentWorkingDirectory,
        baseRelativePath,
        "f24",
        paymentDocuments
      );
    }
  } catch (error) {
    const errorMessage = unknownToString(error);
    return left(errorMessage);
  }
  return right(true);
};

const populateDocumentsFromFolder = (
  category: DocumentCategory,
  workingDirectory: string,
  baseRelativePath: string,
  folder: string,
  array: Array<Document>
): void => {
  const folderAbsolutePath = path.join(
    workingDirectory,
    baseRelativePath,
    folder
  );
  const folderFileList = readdirSync(folderAbsolutePath);

  for (const [index, fileNameWithExtension] of folderFileList.entries()) {
    const fileNameWithExtensionRelativePath = path.join(
      baseRelativePath,
      folder,
      fileNameWithExtension
    );
    const fileNameWithExtensionAbsolutePath = path.join(
      workingDirectory,
      fileNameWithExtensionRelativePath
    );
    const fileSizeAndSHA256 = getFileSizeAndSHA256(
      fileNameWithExtensionAbsolutePath
    );
    const filename = removeExtension(fileNameWithExtension);
    const document: Document = {
      category,
      contentLength: fileSizeAndSHA256.byteSize,
      contentType: "application/pdf",
      filename,
      index,
      relativePath: fileNameWithExtensionRelativePath,
      sha256: fileSizeAndSHA256.sha256
    };
    array.push(document);
  }
};

interface CustomFileInfo {
  byteSize: number;
  sha256: string;
}

const getFileSizeAndSHA256 = (filePath: string): CustomFileInfo => {
  const fileBuffer = readFileSync(filePath);

  const byteSize = fileBuffer.byteLength;

  const hash = createHash("sha256");
  hash.update(fileBuffer);
  const sha256 = hash.digest("hex");

  return {
    byteSize,
    sha256
  };
};

const removeExtension = (filename: string): string => {
  // 1. Get the extension, which preserves the original case (e.g., '.PDF')
  const extension = path.extname(filename);

  // 2. Get the basename, removing the case-specific extension
  return path.basename(filename, extension);
};

export const DocumentsRepository: IDocumentsRepository = {
  documentAtIndex,
  paymentDocumentAtIndex,
  getPaymentDocumentRetryAfterSeconds,
  initializeIfNeeded,
  updateAvailabilityRangeForPaymentDocumentAtIndex
};
