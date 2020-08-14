import { Permission, PermissionsAndroid, Platform } from "react-native";
// check if given permission is granted. If not, a prompt is shown to request permission
export const hasAndroidPermission = async (permission: Permission) => {
  if (Platform.OS !== "android") {
    return true;
  }
  const hasPermission = await PermissionsAndroid.check(permission);
  if (hasPermission) {
    return true;
  }

  const status = await PermissionsAndroid.request(permission);
  return status === "granted";
};
