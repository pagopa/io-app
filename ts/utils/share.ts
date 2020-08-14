import CameraRoll from "@react-native-community/cameraroll";
import { fromLeft, TaskEither, tryCatch } from "fp-ts/lib/TaskEither";
import { PermissionsAndroid, Platform } from "react-native";
import Share from "react-native-share";
import { hasAndroidPermission } from "./permission";

/**
 * share an url see https://react-native-community.github.io/react-native-share/docs/share-open#supported-options
 * @param url
 * @param message option string to attach as a text with shared file
 */
export const share = (
  url: string,
  message?: string,
  failOnCancel: boolean = false
) => {
  return tryCatch(
    () =>
      Share.open({
        url,
        message,
        failOnCancel
      }),
    errorMsg => new Error(String(errorMsg))
  );
};

/***
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
 * @param uri
 */
export const saveImageToGallery = (uri: string): TaskEither<Error, string> => {
  const hasPermission = tryCatch(
    () =>
      hasAndroidPermission(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      ),
    errorMsg => new Error(String(errorMsg))
  );
  const saveImage = tryCatch(
    () => CameraRoll.save(uri, { type: "photo" }),
    errorMsg => new Error(String(errorMsg))
  );

  return hasPermission.chain(hasP => {
    if (hasP) {
      return saveImage;
    }
    return fromLeft<Error, string>(Error("some error occurred"));
  });
};
