import CameraRoll from "@react-native-community/cameraroll";
import {
  fromLeft,
  left,
  right,
  TaskEither,
  tryCatch
} from "fp-ts/lib/TaskEither";
import { PermissionsAndroid, PermissionStatus, Platform } from "react-native";
import Share from "react-native-share";

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

const hasWriteStoragePermission = async () => {
  if (Platform.OS !== "android") {
    return true;
  }
  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

  const hasPermission = await PermissionsAndroid.check(permission);
  if (hasPermission) {
    return true;
  }

  const status = await PermissionsAndroid.request(permission);
  return status === "granted";
};

export const saveImageToGallery = (uri: string): TaskEither<Error, string> => {
  const hasPermission = tryCatch(
    () => hasWriteStoragePermission(),
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
