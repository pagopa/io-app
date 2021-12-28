import { Platform } from "react-native";
import ReactNativeBlobUtil from "react-native-blob-util";
import RNFS from "react-native-fs";
import { fetchTimeout } from "../../config";
import i18n from "../../i18n";
import { ContentTypeValues } from "../../types/contentType";
import { showToast } from "../../utils/showToast";
import { MvlAttachment } from "./types/mvlData";

const savePath =
  Platform.OS === "ios"
    ? RNFS.TemporaryDirectoryPath
    : RNFS.DownloadDirectoryPath;

/**
 * Download an attachment.
 * On iOS download the file using a temporary file with path res.path()
 * On Android download the file using the native download handling
 *
 * TODO: If we want to provide a graphical feedback (eg: download progress) we should move this
 * in a saga and handle the result with a store section
 * @param attachment
 * @param header
 */
export const downloadAttachment = async (
  attachment: MvlAttachment,
  header: { [key: string]: string }
) =>
  ReactNativeBlobUtil.config({
    indicator: true,
    path: savePath + "/" + attachment.displayName,
    timeout: fetchTimeout
  }).fetch("GET", attachment.resourceUrl.href, header);

/**
 * Handle the download of an attachment based on the platform
 * iOS: Display a preview if the contentType is "application/pdf", display OptionMenu otherwise
 * Android: Notify the download completed in the notification center and display a toast
 * @param attachment
 * @param header
 */
export const handleDownloadResult = async (
  attachment: MvlAttachment,
  header: { [key: string]: string }
) => {
  try {
    const result = await downloadAttachment(attachment, header);
    if (Platform.OS === "ios") {
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
      showToast(
        i18n.t("features.mvl.details.attachments.toast.success"),
        "success"
      );
    }
  } catch (e) {
    showToast(i18n.t("features.mvl.details.attachments.toast.failure"));
  }
};
