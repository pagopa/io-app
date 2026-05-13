import { Platform } from "react-native";
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
