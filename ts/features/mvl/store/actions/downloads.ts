import { createAsyncAction, createStandardAction } from "typesafe-actions";
import { MvlAttachment } from "../../types/mvlData";

/**
 * The user requests an MVL attachment download.
 *
 * In case of failure, when error is undefined the request has been cancelled.
 */
export const mvlAttachmentDownload = createAsyncAction(
  "MVL_ATTACHMENT_DOWNLOAD_REQUEST",
  "MVL_ATTACHMENT_DOWNLOAD_SUCCESS",
  "MVL_ATTACHMENT_DOWNLOAD_FAILURE",
  "MVL_ATTACHMENT_DOWNLOAD_CANCEL"
)<
  MvlAttachment,
  { attachment: MvlAttachment; path: string },
  { attachment: MvlAttachment; error: Error },
  MvlAttachment
>();

/**
 * This action removes any cached data in order to perform another download.
 */
export const mvlRemoveCachedAttachment = createStandardAction(
  "MVL_ATTACHMENT_REMOVE_CACHED"
)<{ id: string; path: string | undefined }>();
