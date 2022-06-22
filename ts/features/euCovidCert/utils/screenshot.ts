import * as path from "path";
import * as E from "fp-ts/lib/Either";
import { ReactInstance, RefObject } from "react";
import { Dimensions } from "react-native";
import RNFS from "react-native-fs";
import { CaptureOptions, captureRef } from "react-native-view-shot";
import I18n from "../../../i18n";
import { isIos } from "../../../utils/platform";
import { saveImageToGallery } from "../../../utils/share";

type CaptureScreenshotEvents = {
  onSuccess?: () => void; // invoked on success
  onError?: () => void; // invoked on error
  onEnd?: () => void; // always invoked onSuccess/onError
  onNoPermissions?: () => void; // invoked in no given required permission
};

export type ScreenshotOptions = CaptureOptions & {
  filename: string;
  album?: string;
};

export const screenshotOptions: ScreenshotOptions = {
  width: Dimensions.get("window").width,
  format: "png",
  filename: I18n.t("features.euCovidCertificate.common.title"),
  album: isIos ? I18n.t("features.euCovidCertificate.save.album") : undefined
};

/**
 * utility to save a screenshot as image in the device camera roll
 * @param viewRef the view you want to export as image
 * @param options screenshot options
 * @param onEvent invoked events
 */
export const captureScreenshot = <T>(
  viewRef: number | ReactInstance | RefObject<T>,
  options?: ScreenshotOptions,
  onEvent?: CaptureScreenshotEvents
) =>
  void captureRef(viewRef, options)
    .then(screenshotUri => {
      const imagePath = savePath(screenshotUri, options);
      void rename(screenshotUri, imagePath)
        .then(imagePath => saveImageToGallery(imagePath, options?.album)())
        .then(
          E.fold(
            () => onEvent?.onNoPermissions?.(),
            () => onEvent?.onSuccess?.()
          )
        )
        .catch(onEvent?.onError);
    })
    .catch(onEvent?.onError)
    .finally(onEvent?.onEnd);

/**
 * Build the save path for the screenshot using the filename
 * specified in the given options. If no options are provided
 * the path returned is the same of the source.
 * @param screenshotUri the path of the taken screenshot
 * @param options screenshot options
 * @return a save path for the screenshot with the specified name
 * (if no options are provided it returns the original path)
 */
const savePath = (screenshotUri: string, options?: ScreenshotOptions): string =>
  options
    ? path.join(
        RNFS.TemporaryDirectoryPath,
        `${options.filename}${path.extname(screenshotUri)}`
      )
    : screenshotUri;

/**
 * Rename file source to destination, overwriting destination
 * if it already exists.
 * @param source the path of the file to rename
 * @param destination the destination path
 * @return a Promise with the path of the renamed image
 */
const rename = (source: string, destination: string): Promise<string> => {
  if (source === destination) {
    return Promise.resolve(source);
  }

  // in iOS the move operation will fail if destination already exists,
  // so we need to delete it first
  return RNFS.exists(destination)
    .then(exists => (exists ? RNFS.unlink(destination) : Promise.resolve()))
    .then(_ => RNFS.moveFile(source, destination))
    .then(_ => destination);
};
