import RNFS from "react-native-fs";
import { ThirdPartyAttachment } from "../../../../definitions/backend/ThirdPartyAttachment";
import { apiUrlPrefix } from "../../../config";

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
  const sanitizedFileName = name.trim().replace(/[/\\:*?"<>|]/g, "");
  const sanitizedFileNameWithExtension = !sanitizedFileName
    .toLowerCase()
    .endsWith(".pdf")
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
