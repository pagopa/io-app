import RNFS from "react-native-fs";
import { apiUrlPrefix } from "../../../config";
import { ThirdPartyAttachment } from "../../../../definitions/backend/communication/ThirdPartyAttachment";

export const AttachmentsDirectoryPath =
  RNFS.CachesDirectoryPath + "/attachments";

/**
 * Builds the save path for the given attachment
 * @param attachment
 */
export const pdfSavePath = (
  messageId: string,
  attachmentId: string,
  name: string
) => {
  // Trim leading/trailing whitespace
  // Basic sanitization: remove characters not allowed in filenames (common for most OS)
  // Characters removed: / \ : * ? " < > |
  const maybeEmptySanitizedFileName = name.trim().replace(/[/\\:*?"<>|]/g, "");
  const sanitizedFileName =
    maybeEmptySanitizedFileName.length === 0
      ? "document.pdf"
      : maybeEmptySanitizedFileName;
  const hasPdfExtension = sanitizedFileName.toLowerCase().endsWith(".pdf");
  const sanitizedFileNameWithExtension = !hasPdfExtension
    ? `${sanitizedFileName}.pdf`
    : sanitizedFileName;
  return `${AttachmentsDirectoryPath}/${messageId}/${attachmentId}/${sanitizedFileNameWithExtension}`;
};

export const attachmentDisplayName = (attachment: ThirdPartyAttachment) =>
  attachment.name ?? attachment.id;
export const attachmentContentType = (attachment: ThirdPartyAttachment) =>
  attachment.content_type ?? "application/octet-stream";
export const attachmentDownloadUrl = (
  messageId: string,
  attachment: ThirdPartyAttachment
) =>
  `${apiUrlPrefix}/api/v1/third-party-messages/${messageId}/attachments/${attachment.url.replace(
    /^\//g, // note that attachmentUrl might contains a / at the beginning, so let's strip it
    ""
  )}`;

// This check avoids a backend switch from seconds to
// milliseconds that will cause the app to get stuck.
// It also prevents a retry-after that is too long for the user
export const restrainRetryAfterIntervalInMilliseconds = (
  input: number,
  upperBoundSeconds: number = 24
) => {
  if (input >= 0 && input <= upperBoundSeconds) {
    return 1000 * input;
  }
  if (input >= 1000 && input <= 1000 * upperBoundSeconds) {
    return input;
  }
  return 1000 * upperBoundSeconds;
};

export const getHeaderValueByKey = (
  headers: Record<string, string>,
  key: string
) => {
  const entries = Object.entries(headers);
  const foundEntryPair = entries.find(
    ([propertyName, _value]) => propertyName.toLowerCase() === key.toLowerCase()
  );
  return foundEntryPair?.[1];
};
