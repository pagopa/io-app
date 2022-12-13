import CameraRoll from "@react-native-community/cameraroll";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { PermissionsAndroid, Platform } from "react-native";
import Share from "react-native-share";
import I18n from "../i18n";
import { requestIOAndroidPermission } from "./permission";

/**
 * share an url see https://react-native-share.github.io/react-native-share/docs/share-open#supported-options
 * @param url
 * @param message option string to attach as a text with shared file
 */
export const share = (
  url: string,
  message?: string,
  failOnCancel: boolean = false
) =>
  TE.tryCatch(
    () =>
      Share.open({
        url,
        message,
        failOnCancel
      }),
    errorMsg => new Error(String(errorMsg))
  );

/**
 * Return true if the share is available
 * sharing is disabled on Android versions older than 21 due to a bug causing crash (see https://www.pivotaltracker.com/n/projects/2048617/stories/174295714)
 */
export const isShareEnabled = () =>
  Platform.select({
    android: Platform.Version >= 21,
    ios: true,
    default: false
  });

/**
 * check if write external storage permission is granted, if yes try to save the given uri in the camera roll
 * @param uri the image to save
 * @param album an optional album where to save the image
 */
export const saveImageToGallery = (
  uri: string,
  album?: string
): TE.TaskEither<Error, string> => {
  const hasPermission = TE.tryCatch(
    () =>
      requestIOAndroidPermission(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: I18n.t("permissionRationale.storage.title"),
          message: I18n.t("permissionRationale.storage.message"),
          buttonPositive: I18n.t("global.buttons.choose")
        }
      ),
    errorMsg => new Error(String(errorMsg))
  );
  const saveImage = TE.tryCatch(
    () => CameraRoll.save(uri, { type: "photo", album }),
    errorMsg => new Error(String(errorMsg))
  );

  return pipe(
    hasPermission,
    TE.chain(hasP => {
      if (hasP) {
        return saveImage;
      }
      return TE.left(Error("some error occurred"));
    })
  );
};
