import { Platform } from "react-native";
import {
  checkMultiple,
  Permission,
  PERMISSIONS,
  requestMultiple,
  RESULTS
} from "react-native-permissions";
import { BluetoothStateManager } from "react-native-bluetooth-state-manager";
import { fromPromise } from "xstate";

export const createProximityActorsImplementation = () => {
  const checkPermissions = fromPromise<boolean, void>(async () => {
    // eslint-disable-next-line functional/no-let
    let permissionsToCheck: Array<Permission>;

    if (Platform.OS === "android") {
      if (Platform.Version >= 31) {
        // Android 12 and above: Request new Bluetooth permissions along with location.
        permissionsToCheck = [
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE
        ];
      } else {
        // Android 9 to Android 11: Only location permission is required for BLE.
        permissionsToCheck = [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];
      }
    } else {
      // iOS permissions required are Bluetooth and location.
      permissionsToCheck = [PERMISSIONS.IOS.BLUETOOTH];
    }
    // Check current permission status
    const statuses = await checkMultiple(permissionsToCheck);

    // Filter out already granted permissions
    const permissionsToRequest = permissionsToCheck.filter(
      permission => statuses[permission] !== RESULTS.GRANTED
    );

    if (permissionsToRequest.length > 0) {
      // Request only the missing permissions
      const requestResults = await requestMultiple(permissionsToRequest);

      // Verify if all requested permissions are granted
      return permissionsToRequest.every(
        permission => requestResults[permission] === RESULTS.GRANTED
      );
    }
    return true;
  });

  const checkBluetoothIsActive = fromPromise<boolean, void>(async () => {
    const bluetoothState = await BluetoothStateManager.getState();

    return bluetoothState === "PoweredOn";
  });
  return {
    checkPermissions,
    checkBluetoothIsActive
  };
};
