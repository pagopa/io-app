import { Platform } from "react-native";
import * as RNPermissions from "react-native-permissions";

/**
 * Wrapper function to check and request a permission
 * @param permission Permission to request
 * @param rationale Optional rationale displayed only on Android
 * @returns boolean that indicates wether the user has granted the permission or not
 */
export const requestIOPermission = async (
  permission: RNPermissions.Permission,
  rationale?: RNPermissions.Rationale
): Promise<boolean> => {
  const checkResult = await RNPermissions.check(permission);
  if (checkResult === "granted") {
    return true;
  }

  const requestStatus = await RNPermissions.request(permission, rationale);
  return requestStatus === "granted";
};

/**
 * Wrapper function to check a permission
 * @param permission Permission to request
 * @returns boolean that indicates wether the user has granted the permission or not
 */
export const checkIOPermission = async (
  permission: RNPermissions.Permission
): Promise<boolean> => {
  const checkResult = await RNPermissions.check(permission);
  return checkResult === "granted";
};

/**
 * Wrapper function to request the permission to create an event in the calendar
 * Note: currently unavailable on iOS17, use react-native-calendar-events instead
 * @returns boolean that indicates wether the user has granted the permission or not
 */
export const requestWriteCalendarPermission = async (
  rationale?: RNPermissions.Rationale
) =>
  Platform.select({
    android: requestIOPermission(
      RNPermissions.PERMISSIONS.ANDROID.WRITE_CALENDAR,
      rationale
    ),
    // react-native-permissions currently has problems on iOS 17.
    // Use react-native-calendar-events instead
    // https://github.com/vonovak/react-native-add-calendar-event/issues/180
    ios: Promise.resolve(true),
    default: Promise.resolve(true)
  });

/**
 * Wrapper function to request permission to read images from the gallery
 * @returns boolean that indicates wether the user has granted the permission or not
 */
export const requestMediaPermission = async () => {
  switch (Platform.OS) {
    case "android":
      return requestIOPermission(
        Platform.Version >= 33
          ? RNPermissions.PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
          : RNPermissions.PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
      );
    case "ios":
      return requestIOPermission(RNPermissions.PERMISSIONS.IOS.PHOTO_LIBRARY);
    default:
      return false;
  }
};

/**
 * Wrapper function to request permission to save an image to the library
 * @returns boolean that indicates wether the user has granted the permission or not
 */
export const requestSaveToGalleryPermission = async (
  rationale?: RNPermissions.Rationale
) =>
  Platform.select({
    android: requestIOPermission(
      RNPermissions.PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      rationale
    ),
    ios: requestIOPermission(
      RNPermissions.PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY
    ),
    default: Promise.resolve(true)
  });
