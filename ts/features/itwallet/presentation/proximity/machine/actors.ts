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
import {
  generateAcceptedFields,
  getDocuments,
  getProximityDetails,
  promiseWithTimeout
} from "../utils/itwProximityPresentationUtils";
import { assert } from "../../../../../utils/assert";
import { getError } from "../../../../../utils/errors";
import { Context } from "./context";
import { ProximityEvents } from "./events";

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

const SEND_RESPONSE_TIMEOUT_MS = 20000;

export type StartProximityFlowInput = {
  isRestarting?: boolean;
} | void;

export type GetQrCodeStringActorOutput = Awaited<
  ReturnType<typeof Proximity.getQrCodeString>
>;

export type SendErrorResponseActorOutput = Awaited<
  ReturnType<typeof Proximity.sendErrorResponse>
>;

export type CloseActorOutput = Awaited<ReturnType<typeof Proximity.close>>;

export type ProximityCommunicationLogicActorInput = Pick<
  Context,
  "credentialsByType"
>;

export type SendDocumentsActorInput = Pick<
  Context,
  "credentialsByType" | "verifierRequest"
>;

export type SendDocumentsActorOutput = Awaited<
  ReturnType<typeof Proximity.sendResponse>
>;

export const createProximityActorsImplementation = () => {
  const checkPermissions = fromPromise<boolean>(async () => {
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

  const checkBluetoothIsActive = fromPromise<boolean>(async () => {
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

  const generateQrCodeString = fromPromise<GetQrCodeStringActorOutput>(
    Proximity.getQrCodeString
  );

  const proximityCommunicationLogic = fromCallback<
    ProximityEvents,
    ProximityCommunicationLogicActorInput
  >(({ input, sendBack }) => {
    const handleDeviceConnecting = () => {
      sendBack({ type: "device-connecting" });
    };

    const handleDeviceConnected = () => {
      sendBack({ type: "device-connected" });
    };

    const handleDeviceDisconnected = () => {
      sendBack({ type: "device-disconnected" });
    };

    const handleError = (eventPayload: Proximity.EventsPayload["onError"]) => {
      const { error } = eventPayload ?? {};
      sendBack({ type: "device-error", error: parseError(error) });
    };

    const handleDocumentRequestReceived = (
      eventPayload: Proximity.EventsPayload["onDocumentRequestReceived"]
    ) => {
      const { data } = eventPayload ?? {};

      try {
        assert(data, "Missing required data");

        const parsedRequest = parseVerifierRequest(JSON.parse(data));

        const proximityDetails = getProximityDetails(
          parsedRequest.request,
          input.credentialsByType
        );

        sendBack({
          type: "device-document-request-received",
          proximityDetails,
          verifierRequest: parsedRequest
        });
      } catch (e) {
        sendBack({
          type: "device-error",
          error: getError(e)
        });
      }
    };

    Proximity.addListener("onDeviceConnecting", handleDeviceConnecting);
    Proximity.addListener("onDeviceConnected", handleDeviceConnected);
    Proximity.addListener(
      "onDocumentRequestReceived",
      handleDocumentRequestReceived
    );
    Proximity.addListener("onDeviceDisconnected", handleDeviceDisconnected);
    Proximity.addListener("onError", handleError);

    return () => {
      // Cleanup function
      Proximity.removeListener("onDeviceConnected");
      Proximity.removeListener("onDeviceConnecting");
      Proximity.removeListener("onDeviceDisconnected");
      Proximity.removeListener("onDocumentRequestReceived");
      Proximity.removeListener("onError");
      void Proximity.close();
    };
  });

  const sendDocuments = fromPromise<
    SendDocumentsActorOutput,
    SendDocumentsActorInput
  >(async ({ input }) => {
    const { credentialsByType, verifierRequest } = input;
    assert(verifierRequest, "Missing required verifierRequest");

    const documents = getDocuments(verifierRequest.request, credentialsByType);
    // We accept all the fields requested by the verifier app
    const acceptedFields = generateAcceptedFields(verifierRequest.request);

    const generatedResponse = await Proximity.generateResponse(
      documents,
      acceptedFields
    );

    // If the timeout is exceeded, throw an exception
    return promiseWithTimeout(
      Proximity.sendResponse(generatedResponse),
      SEND_RESPONSE_TIMEOUT_MS
    );
  });

  const terminateProximitySession = fromPromise<SendErrorResponseActorOutput>(
    () => Proximity.sendErrorResponse(Proximity.ErrorCode.SESSION_TERMINATED)
  );

  const closeProximityFlow = fromPromise<CloseActorOutput>(Proximity.close);

  return {
    checkPermissions,
    checkBluetoothIsActive,
    closeProximityFlow,
    generateQrCodeString,
    proximityCommunicationLogic,
    sendDocuments,
    startProximityFlow,
    terminateProximitySession
  };
};
