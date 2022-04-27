import ReactNativeBlobUtil, { RNFetchBlobDf } from "react-native-blob-util";
import RNFS from "react-native-fs";

import i18n from "../../i18n";
import { showToast } from "../../utils/showToast";
import { share } from "../../utils/share";
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

export type PreviewActionConfig =
  | { _tag: "ios"; action: () => void }
  | { _tag: "android"; open: () => void; share: () => void; save: () => void };
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
 * @param showPreview
 */
export const handleDownloadResult = async (
  attachment: MvlAttachment,
  header: { [key: string]: string },
  showPreview: (path: string, actionConfig: PreviewActionConfig) => void
): Promise<void> => {
  try {
    const result = await downloadAttachment(attachment, header);
    const { status } = result.info();
    if (status !== 200) {
      return Promise.reject(
        new Error(`error ${status} fetching ${attachment.resourceUrl.href}`)
      );
    }

    const path = result.path();
    if (attachment.contentType !== ContentTypeValues.applicationPdf) {
      if (isIos) {
        ReactNativeBlobUtil.ios.presentOptionsMenu(result.path());
        return Promise.resolve();
      } else {
        return ReactNativeBlobUtil.android.addCompleteDownload({
          mime: attachment.contentType,
          title: attachment.displayName,
          showNotification: true,
          description: attachment.displayName,
          path: result.path()
        });
      }
    }

    // PDF only
    if (isIos) {
      showPreview(path, {
        _tag: "ios",
        action: () => ReactNativeBlobUtil.ios.presentOptionsMenu(path)
      });
    } else {
      showPreview(path, {
        _tag: "android",
        open: () => {
          ReactNativeBlobUtil.android
            .actionViewIntent(path, attachment.contentType)
            .catch(_ => {
              showToast(
                i18n.t(
                  "features.mvl.details.attachments.pdfPreview.errors.opening"
                )
              );
            });
        },
        share: () => {
          share(`data:application/pdf;${result.base64()}`, undefined, false)
            .run()
            .catch(_ => {
              showToast(
                i18n.t(
                  "features.mvl.details.attachments.pdfPreview.errors.sharing"
                )
              );
            });
        },
        save: () => {
          const destination = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${attachment.displayName}`;
          ReactNativeBlobUtil.fs
            .cp(path, destination)
            .then(_ => {
              showToast(
                i18n.t(
                  "features.mvl.details.attachments.pdfPreview.savedAtLocation",
                  {
                    name: attachment.displayName,
                    location: destination
                  }
                ),
                "success"
              );
            })
            .catch(_ => {
              showToast(
                i18n.t(
                  "features.mvl.details.attachments.pdfPreview.errors.saving"
                )
              );
            });
        }
      });
    }
    return Promise.resolve();
  } catch (e) {
    if (e instanceof Error) {
      return Promise.reject(e);
    }
    return Promise.reject(
      new Error(`couldn't fetch ${attachment.resourceUrl.href}`)
    );
  }
};
