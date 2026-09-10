import { Platform } from "react-native";
import * as RNPermissions from "react-native-permissions";

/**
 * Wrapper function to check and request a permission
 *
 * @param permission Permission to request
 * @param rationale Optional rationale displayed only on Android
 * @returns Boolean that indicates wether the user has granted the permission or
 *   not
 */
export const requestIOPermission = async (
  permission: RNPermissions.Permission,
  rationale?: RNPermissions.Rationale
): Promise<boolean> => {
  const checkResult = await checkIOPermission(permission);
  if (checkResult) {
    return true;
  }

  const requestStatus = await RNPermissions.request(permission, rationale);
  return requestStatus === "granted";
};

/**
 * Wrapper function to check a permission
 *
 * @param permission Permission to request
 * @returns Boolean that indicates wether the user has granted the permission or
 *   not
 */
export const checkIOPermission = async (
  permission: RNPermissions.Permission
): Promise<boolean> => {
  // Be aware that some permissions may return "unavailable" event if the library
  // documents them as supported. One notorious case is the iOS PHOTO_LIBRARY_ADD_ONLY
  // permission. If such permission is automatically handled by the system upon request
  // (such as PHOTO_LIBRARY_ADD_ONLY is), then you should not use this function to
  // check nor to request such permission
  const checkResult = await RNPermissions.check(permission);
  return checkResult === "granted";
};

/**
 * Wrapper function to request the permission to create an event in the calendar
 * Note: currently unavailable on iOS17, use expo-calendar instead
 *
 * @returns Boolean that indicates wether the user has granted the permission or
 *   not
 */
export const requestWriteCalendarPermission = async (
  rationale?: RNPermissions.Rationale
) => {
  if (Platform.OS === "android") {
    return requestIOPermission(
      RNPermissions.PERMISSIONS.ANDROID.WRITE_CALENDAR,
      rationale
    );
  }
  return Promise.resolve(true);
};
