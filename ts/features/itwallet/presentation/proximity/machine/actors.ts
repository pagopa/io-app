import { Platform } from "react-native";
import {
  checkMultiple,
  Permission,
  PERMISSIONS,
  requestMultiple,
  RESULTS
} from "react-native-permissions";
import BluetoothStateManager from "react-native-bluetooth-state-manager";
import { fromPromise } from "xstate";
import { Proximity } from "@pagopa/io-react-native-proximity";
import { constUndefined } from "fp-ts/lib/function";

const PERMISSIONS_TO_CHECK: Array<Permission> =
  Platform.OS === "android"
    ? Platform.Version >= 31
      ? [
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE
        ] // Android 12 and above: Request new Bluetooth permissions along with location.
      : [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] // Android 9 to Android 11: Only location permission is required for BLE.
    : [PERMISSIONS.IOS.BLUETOOTH]; // iOS permissions required are Bluetooth and location.

export type StartProximityFlowInput = {
  isRestarting?: boolean;
} | void;

export const createProximityActorsImplementation = () => {
  const checkPermissions = fromPromise<boolean, void>(async () => {
    // Check current permission status
    const statuses = await checkMultiple(PERMISSIONS_TO_CHECK);

    // Filter out already granted permissions
    const permissionsToRequest = PERMISSIONS_TO_CHECK.filter(
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

  const startProximityFlow = fromPromise<void, StartProximityFlowInput>(
    async ({ input }) => {
      if (input?.isRestarting) {
        // The proximity flow must be closed before restarting
        await Proximity.close().catch(constUndefined);
      }
      await Proximity.start();
    }
  );

  const generateQRCodeString = fromPromise<string, void>(async () =>
    Proximity.getQrCodeString()
  );

  const closeProximityFlow = fromPromise<void, void>(async () => {
    await Proximity.close();
  });

  return {
    checkPermissions,
    checkBluetoothIsActive,
    startProximityFlow,
    generateQRCodeString,
    closeProximityFlow
  };
};
