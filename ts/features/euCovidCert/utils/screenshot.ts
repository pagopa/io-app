import path from "path";
import { CaptureOptions, captureRef } from "react-native-view-shot";
import { ReactInstance, RefObject } from "react";
import { Dimensions } from "react-native";
import RNFS from "react-native-fs";
import { saveImageToGallery } from "../../../utils/share";
import I18n from "../../../i18n";

type CaptureScreenShotEvents = {
  onSuccess?: () => void; // invoked on success
  onError?: () => void; // invoked on error
  onEnd?: () => void; // always invoked onSuccess/onError
  onNoPermissions?: () => void; // invoked in no given required permission
};

export type ScreenshotOptions = CaptureOptions & {
  filename: string;
};

export const screenShotOption: ScreenshotOptions = {
  width: Dimensions.get("window").width,
  format: "png",
  filename: I18n.t("features.euCovidCertificate.common.title")
};

/**
 * utility to save a screenshot as image in the device camera roll
 * @param viewRef the view you want to export as image
 * @param options screenshot options
 * @param onEvent invoked events
 */
export const captureScreenShoot = <T>(
  viewRef: number | ReactInstance | RefObject<T>,
  options?: ScreenshotOptions,
  onEvent?: CaptureScreenShotEvents
) =>
  void captureRef(viewRef, options)
    .then(screenShotUri => {
      const imagePath = savePath(screenShotUri, options);
      void rename(screenShotUri, imagePath)
        .then(imagePath => saveImageToGallery(imagePath).run())
        .then(maybeSaved => {
          maybeSaved.fold(
            () => onEvent?.onNoPermissions?.(),
            () => onEvent?.onSuccess?.()
          );
        })
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
