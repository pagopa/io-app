import {
  Permission,
  PermissionsAndroid,
  Platform,
  Rationale
} from "react-native";
import { AsyncAlert } from "./asyncAlert";

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
  rationale: Rationale
): Promise<boolean> => {
  if (Platform.OS !== "android") {
    return true;
  }
  const hasPermission = await PermissionsAndroid.check(permission);
  if (hasPermission) {
    return true;
  }

  await AsyncAlert(rationale.title, rationale.message, [
    { text: rationale.buttonPositive, style: "default" }
  ]);

  const status = await PermissionsAndroid.request(permission);
  return status === "granted";
};
