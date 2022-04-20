import { createAsyncAction } from "typesafe-actions";
import { MvlAttachmentId } from "../../types/mvlData";

/**
 * The user requests an MVL attachment download
 */
export const mvlAttachmentDownload = createAsyncAction(
  "MVL_ATTACHMENT_DOWNLOAD_REQUEST",
  "MVL_ATTACHMENT_DOWNLOAD_SUCCESS",
  "MVL_ATTACHMENT_DOWNLOAD_ERROR"
)<
  MvlAttachmentId,
  { id: MvlAttachmentId; path: string },
  { id: MvlAttachmentId; error: Error }
>();
