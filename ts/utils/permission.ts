import {
  Permission,
  PermissionsAndroid,
  Platform,
  Rationale
} from "react-native";

/**
 * This function enhance and wraps the react-native function {@link PermissionsAndroid.request}, in order to give to the user
 * a prominent disclosure why that permission must be requested.
 * The default behaviour of {@link PermissionsAndroid.request} displays the alert only in for
 * https://developer.android.com/training/permissions/requesting.html#explain (the user refused to give permissions )
 * but we should always explain the reason, also the first time (the user did not make any choices)
 * @param permission
 * @param rationale
 */
export const requestIOAndroidPermission = async (
  permission: Permission,
  rationale?: Rationale
): Promise<boolean> => {
  const hasPermission = await checkIOAndroidPermission(permission);
  if (hasPermission) {
    return true;
  }

  const status = await PermissionsAndroid.request(permission, rationale);
  return status === "granted";
};

export const checkIOAndroidPermission = async (
  permission: Permission
): Promise<boolean> => {
  if (Platform.OS !== "android") {
    return true;
  }
  return await PermissionsAndroid.check(permission);
};

/**
 * Wrapper function for `requestIOAndroidPermission`.
 * Handles media permissions based on Android API levels.
 * @returns
 */
export const requestIOAndroidMediaPermission = async (
  rationale?: Rationale
): Promise<boolean> => {
  if (Platform.OS === "android") {
    if (Platform.Version >= 33) {
      return requestIOAndroidPermission(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        rationale
      );
    } else {
      return requestIOAndroidPermission(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        rationale
      );
    }
  }

  return true;
};
