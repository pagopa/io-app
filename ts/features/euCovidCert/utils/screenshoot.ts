import { CaptureOptions, captureRef } from "react-native-view-shot";
import { Toast } from "native-base";
import { ReactInstance, RefObject } from "react";
import { saveImageToGallery } from "../../../utils/share";
import I18n from "../../../i18n";
import { showToast } from "../../../utils/showToast";

export const captureScreenShoot = <T>(
  viewRef: number | ReactInstance | RefObject<T>,
  options?: CaptureOptions,
  onSuccess?: () => void,
  onError: () => void = () =>
    Toast.show({ text: I18n.t("global.genericError") }),
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
    .finally(() => {
      onEnd?.();
    });
