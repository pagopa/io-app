import { CaptureOptions, captureRef } from "react-native-view-shot";
import { ReactInstance, RefObject } from "react";
import { saveImageToGallery } from "../../../utils/share";
import I18n from "../../../i18n";
import { showToast } from "../../../utils/showToast";

/**
 * utility to save a screenshot as image in the device camera roll
 * @param viewRef the view you want to export as image
 * @param options screenshot options
 * @param onSuccess invoked on success
 * @param onError invoken on error
 * @param onEnd always invoked onSuccess/onError
 */
export const captureScreenShoot = <T>(
  viewRef: number | ReactInstance | RefObject<T>,
  options?: CaptureOptions,
  onSuccess?: () => void,
  onError?: () => void,
  onEnd?: () => void
) =>
  void captureRef(viewRef, options)
    .then(screenShotUri => {
      saveImageToGallery(`file://${screenShotUri}`)
        .run()
        .then(maybeSaved => {
          maybeSaved.fold(
            () =>
              // no permission error
              showToast(
                I18n.t("features.euCovidCertificate.save.noPermission")
              ),
            () => {
              // success
              onSuccess?.();
            }
          );
        })
        .catch(onError);
    })
    .catch(onError)
    .finally(onEnd);
