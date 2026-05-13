import { ISO18013_5 } from "@pagopa/io-react-native-iso18013";
import BluetoothStateManager from "react-native-bluetooth-state-manager";
import { fromCallback, fromPromise } from "xstate";
import { assert } from "../../../../../utils/assert";
import { Env } from "../../../common/utils/environment";
import { CredentialFormat } from "../../../common/utils/itwTypesUtils";
import { CredentialsVault } from "../../../credentials/utils/vault";
import {
  generateAcceptedFields,
  getDocuments,
  getProximityDetails,
  promiseWithTimeout
} from "../utils/itwProximityPresentationUtils";
import {
  areProximityPermissionsGranted,
  isBluetoothPoweredOn,
  PROXIMITY_PERMISSIONS_TO_CHECK
} from "../utils";
import type { EventsPayload } from "../utils/itwProximityTypeUtils";
import { checkBluetoothPermissions } from "../utils/permissions";
import { Context } from "./context";
import { ProximityEvents } from "./events";

const SEND_RESPONSE_TIMEOUT_MS = 20000;

export type SendErrorResponseActorOutput = Awaited<
  ReturnType<typeof ISO18013_5.sendErrorResponse>
>;

export type CloseActorOutput = Awaited<ReturnType<typeof ISO18013_5.close>>;

export type ProximityCommunicationLogicInput = Pick<Context, "credentials">;

export type SendDocumentsActorInput = Pick<
  Context,
  "walletInstanceAttestation" | "credentials" | "verifierRequest"
>;

export type SendDocumentsActorOutput = Awaited<
  ReturnType<typeof ISO18013_5.sendResponse>
>;

export const createProximityActorsImplementation = (env: Env) => {
  const checkBluetoohPermissions = fromPromise<boolean>(
    checkBluetoothPermissions
  );

  const checkBluetoothActivation = fromPromise<boolean>(async () => {
    const bluetoothState = await BluetoothStateManager.getState();
    return bluetoothState === "PoweredOn";
  });

  const checkBluetoothIsActive = fromPromise<boolean, void>(
    isBluetoothPoweredOn
  );

  const startEngagement = fromPromise<void>(async () => {
    // Ensure any existing session is closed before starting a new one
    await ISO18013_5.close().catch(() => null);

    // Start a new engagement session with QRCode -> Ble configuration
    await ISO18013_5.startEngagement({
      engagementModes: ["qrcode"],
      retrievalMethods: ["ble"],
      certificates: [[env.X509_CERT_ROOT]]
    });
  });

  const proximityCommunicationLogic = fromCallback<
    ProximityEvents,
    ProximityCommunicationLogicInput
  >(({ sendBack, input }) => {
    const { credentials } = input;

    assert(
      credentials,
      "Missing credentials for proximity communication logic"
    );

    const handleQrCodeString = (
      eventPayload: EventsPayload["onQrCodeString"]
    ) => {
      sendBack({ type: "qr-code-string", payload: eventPayload.data });
    };

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

        const parsedRequest = ISO18013_5.parseVerifierRequest(JSON.parse(data));
        // const credentials = itwCredentialsByTypeSelector(store.getState());
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
      ISO18013_5.addListener("onQrCodeString", handleQrCodeString),
      ISO18013_5.addListener("onDeviceConnecting", handleDeviceConnecting),
      ISO18013_5.addListener("onDeviceConnected", handleDeviceConnected),
      ISO18013_5.addListener(
        "onDocumentRequestReceived",
        handleDocumentRequestReceived
      ),
      ISO18013_5.addListener("onDeviceDisconnected", handleDeviceDisconnected),
      ISO18013_5.addListener("onError", handleError)
    ];

    return () => {
      // Remove event listeners
      listeners.forEach(listener => listener.remove());
      // Close the Bluetooth connection and clear all resources
      void ISO18013_5.close().catch(() => null);
    };
  });

  const sendDocuments = fromPromise<
    SendDocumentsActorOutput,
    SendDocumentsActorInput
  >(async ({ input }) => {
    const { verifierRequest, walletInstanceAttestation, credentials } = input;

    assert(credentials, "Missing credentials for sending documents");
    assert(verifierRequest, "Missing verifier request");
    assert(
      walletInstanceAttestation,
      "Missing wallet instance attestation for sending documents"
    );

    const wiaMdoc = walletInstanceAttestation[CredentialFormat.MDOC];
    assert(wiaMdoc, "Missing Wallet Attestation in MDOC format");

    const documents = await getDocuments(
      verifierRequest.request,
      credentials,
      wiaMdoc,
      CredentialsVault.get
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
    checkBluetoohPermissions,
    checkBluetoothActivation,
    startEngagement,
    proximityCommunicationLogic,
    closeProximityFlow,
    sendDocuments,
    terminateProximitySession
  };
};
