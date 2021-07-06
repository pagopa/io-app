import { CaptureOptions, captureRef } from "react-native-view-shot";
import { ReactInstance, RefObject } from "react";
import { Dimensions } from "react-native";
import { saveImageToGallery } from "../../../utils/share";

type CaptureScreenShotEvents = {
  onSuccess?: () => void; // invoked on success
  onError?: () => void; // invoked on error
  onEnd?: () => void; // always invoked onSuccess/onError
  onNoPermissions?: () => void; // invoked in no given required permission
};

export const screenShotOption: CaptureOptions = {
  width: Dimensions.get("window").width,
  format: "png"
};

/**
 * utility to save a screenshot as image in the device camera roll
 * @param viewRef the view you want to export as image
 * @param options screenshot options
 * @param onEvent invoked events
 */
export const captureScreenShoot = <T>(
  viewRef: number | ReactInstance | RefObject<T>,
  options?: CaptureOptions,
  onEvent?: CaptureScreenShotEvents
) =>
  void captureRef(viewRef, options)
    .then(screenShotUri => {
      saveImageToGallery(`file://${screenShotUri}`)
        .run()
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
