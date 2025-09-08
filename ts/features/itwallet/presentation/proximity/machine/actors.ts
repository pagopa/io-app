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
import { ISO18013_5 } from "@pagopa/io-react-native-iso18013";
import {
  generateAcceptedFields,
  getDocuments,
  getProximityDetails,
  promiseWithTimeout
} from "../utils/itwProximityPresentationUtils";
import { assert } from "../../../../../utils/assert";
import {
  trackItwProximityBluetoothBlock,
  trackItwProximityBluetoothBlockAction
} from "../analytics";
import type { EventsPayload } from "../utils/itwProximityTypeUtils";
import { useIOStore } from "../../../../../store/hooks";
import { itwCredentialsByTypeSelector } from "../store/selectors";
import { itwWalletInstanceAttestationSelector } from "../../../walletInstance/store/selectors";
import { CredentialFormat } from "../../../common/utils/itwTypesUtils";
import { Env } from "../../../common/utils/environment";
import { ProximityEvents } from "./events";
import { Context } from "./context";

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

export type CheckPermissionsInput = {
  isSilent?: boolean;
};

export type StartProximityFlowInput = {
  isRestarting?: boolean;
} | void;

export type GetQrCodeStringActorOutput = Awaited<
  ReturnType<typeof ISO18013_5.getQrCodeString>
>;

export type SendErrorResponseActorOutput = Awaited<
  ReturnType<typeof ISO18013_5.sendErrorResponse>
>;

export type CloseActorOutput = Awaited<ReturnType<typeof ISO18013_5.close>>;

export type SendDocumentsActorInput = Pick<Context, "verifierRequest">;

export type SendDocumentsActorOutput = Awaited<
  ReturnType<typeof ISO18013_5.sendResponse>
>;

export const createProximityActorsImplementation = (
  env: Env,
  store: ReturnType<typeof useIOStore>
) => {
  const checkPermissions = fromPromise<boolean, CheckPermissionsInput>(
    async ({ input }) => {
      const isSilent = input?.isSilent || false;

      // Check current permission status
      const statuses = await checkMultiple(PERMISSIONS_TO_CHECK);

      // Filter out already granted permissions
      const permissionsToRequest = PERMISSIONS_TO_CHECK.filter(
        permission => statuses[permission] !== RESULTS.GRANTED
      );

      if (permissionsToRequest.length > 0) {
        if (!isSilent) {
          trackItwProximityBluetoothBlock();
        }
        // Request only the missing permissions
        const requestResults = await requestMultiple(permissionsToRequest);

        const allPermissionsGranted = permissionsToRequest.every(
          permission => requestResults[permission] === RESULTS.GRANTED
        );

        if (!isSilent) {
          const userAction = allPermissionsGranted ? "allow" : "not_allow";
          trackItwProximityBluetoothBlockAction(userAction);
        }

        // Verify if all requested permissions are granted
        return allPermissionsGranted;
      }
      return true;
    }
  );

  const checkBluetoothIsActive = fromPromise<boolean, void>(async () => {
    const bluetoothState = await BluetoothStateManager.getState();

    return bluetoothState === "PoweredOn";
  });

  const startProximityFlow = fromPromise<void, StartProximityFlowInput>(
    async ({ input }) => {
      if (input?.isRestarting) {
        // The proximity flow must be closed before restarting
        await ISO18013_5.close().catch(constUndefined);
      }
      await ISO18013_5.start({ certificates: [[env.X509_CERT_ROOT]] });
    }
  );

  const generateQrCodeString = fromPromise<GetQrCodeStringActorOutput, void>(
    ISO18013_5.getQrCodeString
  );

  const proximityCommunicationLogic = fromCallback<ProximityEvents>(
    ({ sendBack }) => {
      const handleDeviceConnecting = () => {
        sendBack({ type: "device-connecting" });
      };

      const handleDeviceConnected = () => {
        sendBack({ type: "device-connected" });
      };

      const handleDeviceDisconnected = () => {
        sendBack({ type: "device-disconnected" });
      };

      const handleError = (eventPayload: EventsPayload["onError"]) => {
        const { error } = eventPayload ?? {};
        sendBack({
          type: "device-error",
          error
        });
      };

      const handleDocumentRequestReceived = (
        eventPayload: EventsPayload["onDocumentRequestReceived"]
      ) => {
        const { data } = eventPayload ?? {};

        try {
          assert(data, "Missing required data");

          const parsedRequest = ISO18013_5.parseVerifierRequest(
            JSON.parse(data)
          );
          const credentials = itwCredentialsByTypeSelector(store.getState());
          const proximityDetails = getProximityDetails(
            parsedRequest.request,
            credentials
          );

          sendBack({
            type: "device-document-request-received",
            proximityDetails,
            verifierRequest: parsedRequest
          });
        } catch (error) {
          // Give some time to show the loading message
          // and avoid glitches in the UI.
          setTimeout(() => {
            sendBack({
              type: "device-error",
              error
            });
          }, 500);
        }
      };

      const listeners = [
        ISO18013_5.addListener("onDeviceConnecting", handleDeviceConnecting),
        ISO18013_5.addListener("onDeviceConnected", handleDeviceConnected),
        ISO18013_5.addListener(
          "onDocumentRequestReceived",
          handleDocumentRequestReceived
        ),
        ISO18013_5.addListener(
          "onDeviceDisconnected",
          handleDeviceDisconnected
        ),
        ISO18013_5.addListener("onError", handleError)
      ];

      return () => {
        // Remove event listeners
        listeners.forEach(listener => listener.remove());
        // Close the Bluetooth connection and clear all resources
        void ISO18013_5.close().catch(constUndefined);
      };
    }
  );

  const sendDocuments = fromPromise<
    SendDocumentsActorOutput,
    SendDocumentsActorInput
  >(async ({ input }) => {
    const { verifierRequest } = input;
    assert(verifierRequest, "Missing required verifierRequest");

    const credentials = itwCredentialsByTypeSelector(store.getState());
    const wiaMdoc = itwWalletInstanceAttestationSelector(store.getState())?.[
      CredentialFormat.MDOC
    ];
    assert(wiaMdoc, "Missing Wallet Attestation in MDOC format");

    const documents = getDocuments(
      verifierRequest.request,
      credentials,
      wiaMdoc
    );
    // We accept all the fields requested by the verifier app
    const acceptedFields = generateAcceptedFields(verifierRequest.request);

    const generatedResponse = await ISO18013_5.generateResponse(
      documents,
      acceptedFields
    );

    // If the timeout is exceeded, throw an exception
    return promiseWithTimeout(
      ISO18013_5.sendResponse(generatedResponse),
      SEND_RESPONSE_TIMEOUT_MS
    );
  });

  const terminateProximitySession = fromPromise<SendErrorResponseActorOutput>(
    () => ISO18013_5.sendErrorResponse(ISO18013_5.ErrorCode.SESSION_TERMINATED)
  );

  const closeProximityFlow = fromPromise<CloseActorOutput, void>(
    ISO18013_5.close
  );

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
