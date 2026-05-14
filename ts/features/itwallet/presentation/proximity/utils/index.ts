import BluetoothStateManager from "react-native-bluetooth-state-manager";
import { Linking, Platform } from "react-native";
import AndroidOpenSettings from "react-native-android-open-settings";
import {
  checkMultiple,
  Permission,
  PERMISSIONS,
  RESULTS
} from "react-native-permissions";

export const openBluetoothPreferences = () => {
  if (Platform.OS === "ios") {
    Linking.openURL("App-Prefs:Bluetooth").catch(() => null);
  } else {
    AndroidOpenSettings.bluetoothSettings();
  }
};

/**
 * Permissions required by the proximity (BLE) flow on each platform.
 * - Android 12+ (API 31): the new runtime Bluetooth permissions.
 * - Android 9–11: only fine location, used by BLE scanning.
 * - iOS: the Bluetooth permission.
 */
export const PROXIMITY_PERMISSIONS_TO_CHECK: Array<Permission> =
  Platform.OS === "android"
    ? Platform.Version >= 31
      ? [
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE
        ]
      : [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]
    : [PERMISSIONS.IOS.BLUETOOTH];

/**
 * Returns true when every permission required by the proximity flow has been
 * granted by the user. Does not prompt the user — only reads the current
 * status. Use it to verify the outcome after the user comes back from the
 * system Settings screen.
 */
export const areProximityPermissionsGranted = async (): Promise<boolean> => {
  const statuses = await checkMultiple(PROXIMITY_PERMISSIONS_TO_CHECK);
  return PROXIMITY_PERMISSIONS_TO_CHECK.every(
    permission => statuses[permission] === RESULTS.GRANTED
  );
};

/**
 * Returns true when the device Bluetooth is currently powered on.
 * Reads the current state without subscribing to changes.
 */
export const isBluetoothPoweredOn = async (): Promise<boolean> => {
  const state = await BluetoothStateManager.getState();
  return state === "PoweredOn";
};
