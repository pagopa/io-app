import { Linking, Platform } from "react-native";
import AndroidOpenSettings from "react-native-android-open-settings";
import { BleManager, State } from "react-native-ble-plx";
import {
  checkMultiple,
  Permission,
  PERMISSIONS,
  requestMultiple,
  RESULTS
} from "react-native-permissions";

const BLUETOOTH_PERMISSIONS: Array<Permission> =
  Platform.OS === "android"
    ? Platform.Version >= 31
      ? [
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE
        ] // Android 12 and above: Request new Bluetooth permissions along with location.
      : [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] // Android 9 to Android 11: Only location permission is required for BLE.
    : [PERMISSIONS.IOS.BLUETOOTH];

/**
 * Checks and requests necessary Bluetooth permissions based on the platform
 * and OS version.
 *
 * @returns A promise that resolves to true if all required permissions are
 * granted, or false otherwise.
 */
export const checkBluetoothPermissions = async () => {
  // Check current permission status
  const statuses = await checkMultiple(BLUETOOTH_PERMISSIONS);

  // Filter out already granted permissions
  const permissionsToRequest = BLUETOOTH_PERMISSIONS.filter(
    permission => statuses[permission] !== RESULTS.GRANTED
  );

  if (permissionsToRequest.length > 0) {
    // Request only the missing permissions
    const requestResults = await requestMultiple(permissionsToRequest);

    const allPermissionsGranted = permissionsToRequest.every(
      permission => requestResults[permission] === RESULTS.GRANTED
    );

    // Verify if all requested permissions are granted
    return allPermissionsGranted;
  }

  return true;
};

// This workaround ensures that the BleManager instance is created lazily,
// preventing the Bluetooth permission prompt from appearing immediately upon module import.
// eslint-disable-next-line functional/no-let
let bleManager: BleManager | undefined;

const getBleManager = () => {
  if (!bleManager) {
    bleManager = new BleManager();
  }
  return bleManager;
};

/**
 * Checks if Bluetooth is currently activated on the device.
 * @returns A promise that resolves to true if Bluetooth is powered on, or false otherwise.
 */
export const checkBluetoothActivation = async () => {
  const bluetoothState = await getBleManager().state();
  return bluetoothState === State.PoweredOn;
};

/**
 * Opens the Bluetooth settings page on the device. On iOS, it attempts to open
 * the Bluetooth settings directly, while on Android it opens the Bluetooth
 * settings screen.
 */
export const openBluetoothPreferences = () => {
  if (Platform.OS === "ios") {
    Linking.openURL("App-Prefs:Bluetooth").catch(() => null);
  } else {
    AndroidOpenSettings.bluetoothSettings();
  }
};
