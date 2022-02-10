import ReactNativeBlobUtil from "react-native-blob-util";
import RNFS from "react-native-fs";
import { fetchTimeout } from "../../config";
import { ContentTypeValues } from "../../types/contentType";
import { isIos } from "../../utils/platform";
import { MvlAttachment } from "./types/mvlData";

const savePath = isIos
  ? RNFS.TemporaryDirectoryPath
  : RNFS.DownloadDirectoryPath;

/**
 * Download an attachment.
 * On iOS download the file using a temporary file with path res.path()
 * On Android download the file using the native download handling
 *
 * we should move this to a saga and handle the result with a store section
 * @param attachment
 * @param header
 */
const downloadAttachment = async (
  attachment: MvlAttachment,
  header: { [key: string]: string }
) =>
  ReactNativeBlobUtil.config({
    indicator: true,
    path: savePath + "/" + attachment.displayName,
    timeout: fetchTimeout
  }).fetch("GET", attachment.resourceUrl.href, header);

/**
 * Handle the download of an attachment based on the platform.
 * Reject with an Error if any error occurs.
 *
 * iOS: display a preview if the contentType is "application/pdf",
 *      display OptionMenu otherwise.
 *
 * Android: Notify the download completed in the notification center
 *          and display a toast.
 *
 * @param attachment
 * @param header
 */
export const handleDownloadResult = async (
  attachment: MvlAttachment,
  header: { [key: string]: string }
): Promise<void> => {
  try {
    const result = await downloadAttachment(attachment, header);
    const { status } = result.info();
    if (status !== 200) {
      return Promise.reject(
        new Error(`error ${status} fetching ${attachment.resourceUrl.href}`)
      );
    }
    if (isIos) {
      const fileHandler =
        attachment.contentType === ContentTypeValues.applicationPdf
          ? ReactNativeBlobUtil.ios.openDocument
          : ReactNativeBlobUtil.ios.presentOptionsMenu;
      fileHandler(result.path());
    } else {
      await ReactNativeBlobUtil.android.addCompleteDownload({
        mime: attachment.contentType,
        title: attachment.displayName,
        showNotification: true,
        description: attachment.displayName,
        path: result.path()
      });
    }
  } catch (e) {
    if (e instanceof Error) {
      return Promise.reject(e);
    }
    return Promise.reject(
      new Error(`couldn't fetch ${attachment.resourceUrl.href}`)
    );
  }
};
