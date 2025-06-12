import { constUndefined } from "fp-ts/lib/function";
import { fromCallback, fromPromise } from "xstate";
import { Platform } from "react-native";
import {
  checkMultiple,
  Permission,
  PERMISSIONS,
  requestMultiple,
  RESULTS
} from "react-native-permissions";
import BluetoothStateManager from "react-native-bluetooth-state-manager";
import {
  Proximity,
  parseError,
  parseVerifierRequest
} from "@pagopa/io-react-native-proximity";
import { ProximityEvents } from "./events";

export type StartProximityFlowInput = {
  isRestarting?: boolean;
} | void;

export type GetQrCodeStringActorOutput = Awaited<
  ReturnType<typeof Proximity.getQrCodeString>
>;

export type SendErrorResponseActorOutput = Awaited<
  ReturnType<typeof Proximity.sendErrorResponse>
>;

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

  const startProximityFlow = fromPromise<void, StartProximityFlowInput>(
    async ({ input }) => {
      if (input?.isRestarting) {
        // The proximity flow must be closed before restarting
        await Proximity.close().catch(constUndefined);
      }
      await Proximity.start();
    }
  );

  const generateQrCodeString = fromPromise<GetQrCodeStringActorOutput, void>(
    Proximity.getQrCodeString
  );

  const proximityCommunicationLogic = fromCallback<ProximityEvents>(
    ({ receive, sendBack }) => {
      const handleDeviceConnecting = () => {
        sendBack({ type: "device-connecting" });
      };

      const handleDeviceConnected = () => {
        sendBack({ type: "device-connected" });
      };

      const handleDeviceDisconnected = () => {
        sendBack({ type: "device-error", payload: "Device disconnected" });
      };

      const handleError = (
        eventPayload: Proximity.EventsPayload["onError"]
      ) => {
        const { error } = eventPayload ?? {};
        sendBack({ type: "device-error", payload: parseError(error) });
      };

      const handleDocumentRequestReceived = (
        eventPayload: Proximity.EventsPayload["onDocumentRequestReceived"]
      ) => {
        const { data } = eventPayload ?? {};

        if (data === undefined) {
          sendBack({
            type: "device-error",
            error: "Missing required data"
          });
          return;
        }

        const parsedRequest = parseVerifierRequest(JSON.parse(data));

        sendBack({
          type: "device-document-request-received",
          proximityDetails: [], // TODO: [SIW-2429]
          verifierRequest: parsedRequest
        });
      };

      Proximity.addListener("onDeviceConnecting", handleDeviceConnecting);
      Proximity.addListener("onDeviceConnected", handleDeviceConnected);
      Proximity.addListener(
        "onDocumentRequestReceived",
        handleDocumentRequestReceived
      );
      Proximity.addListener("onDeviceDisconnected", handleDeviceDisconnected);
      Proximity.addListener("onError", handleError);

      receive(event => {
        if (event.type === "back") {
          sendBack({ type: "close" });
        }
      });

      return () => {
        // Cleanup function
        Proximity.removeListener("onDeviceConnected");
        Proximity.removeListener("onDeviceConnecting");
        Proximity.removeListener("onDeviceDisconnected");
        Proximity.removeListener("onDocumentRequestReceived");
        Proximity.removeListener("onError");
        void Proximity.close();
      };
    }
  );

  const terminateProximitySession = fromPromise<SendErrorResponseActorOutput>(
    () => Proximity.sendErrorResponse(Proximity.ErrorCode.SESSION_TERMINATED)
  );

  const closeProximityFlow = fromPromise<boolean>(Proximity.close);

  return {
    checkPermissions,
    checkBluetoothIsActive,
    startProximityFlow,
    generateQrCodeString,
    closeProximityFlow,
    proximityCommunicationLogic,
    terminateProximitySession
  };
};
