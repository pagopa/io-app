import _ from "lodash";
import {
  StateFrom,
  assign,
  createActor,
  fromCallback,
  fromPromise,
  waitFor
} from "xstate";
import {
  CredentialMetadata,
  WalletInstanceAttestations
} from "../../../../common/utils/itwTypesUtils";
import {
  generateConsentKey,
  getConsentDataFromProximityDetails
} from "../../store/utils";
import { ProximityFailureType } from "../failure";
import { ItwProximityMachine, itwProximityMachine } from "../machine";
import { ProximityDetails, VerifierRequest } from "../../utils/types";

type MachineSnapshot = StateFrom<ItwProximityMachine>;

const T_WIA = { jwt: "test-wia" } as WalletInstanceAttestations;
const T_CREDENTIALS = {} as Record<string, CredentialMetadata>;
const T_QR_CODE = "mdoc://test-qr-code";
const T_PROXIMITY_DETAILS: ProximityDetails = [
  {
    rpId: "verifier.example.com",
    credentialType: "MDL",
    claimsToDisplay: [
      { id: "given_name", label: "Given Name", value: "Alice" },
      { id: "family_name", label: "Family Name", value: "Smith" }
    ]
  }
];
const T_PROXIMITY_DETAILS_B: ProximityDetails = [
  {
    rpId: "other-verifier.example.com",
    credentialType: "MDL",
    claimsToDisplay: [
      { id: "given_name", label: "Given Name", value: "Alice" },
      { id: "family_name", label: "Family Name", value: "Smith" }
    ]
  }
];
const T_VERIFIER_REQUEST = {} as VerifierRequest;

describe("itwProximityMachine", () => {
  const onInit = jest.fn();
  const navigateToBluetoothPermissionsScreen = jest.fn();
  const navigateToBluetoothActivationScreen = jest.fn();
  const navigateToNfcActivationScreen = jest.fn();
  const navigateToNfcPresentmentScreen = jest.fn();
  const navigateToPresentmentScreen = jest.fn();
  const navigateToFailureScreen = jest.fn();
  const navigateToClaimsDisclosureScreen = jest.fn();
  const navigateToStoreconsentScreen = jest.fn();
  const navigateToSuccessScreen = jest.fn();
  const closeProximity = jest.fn();

  const storeConsent = jest.fn();

  const checkBluetoothPermissions = jest.fn();
  const checkBluetoothActivation = jest.fn();
  const checkNfcActivation = jest.fn();
  const startEngagement = jest.fn();
  const sendDocuments = jest.fn();
  const terminateSession = jest.fn();

  const mockedMachine = itwProximityMachine.provide({
    actions: {
      onInit: assign(() => {
        onInit();

        return {
          walletInstanceAttestation: T_WIA,
          credentials: T_CREDENTIALS
        };
      }),
      navigateToBluetoothPermissionsScreen,
      navigateToBluetoothActivationScreen,
      navigateToNfcActivationScreen,
      navigateToNfcPresentmentScreen,
      navigateToPresentmentScreen,
      navigateToFailureScreen,
      navigateToClaimsDisclosureScreen,
      navigateToStoreconsentScreen,
      navigateToSuccessScreen,
      closeProximity,
      grantConsent: assign(({ context }) => {
        if (!context.proximityDetails) {
          throw new Error(
            "ProximityDetails must be present in context to grant consent"
          );
        }
        return {
          grantedConsentKey: generateConsentKey(
            getConsentDataFromProximityDetails(context.proximityDetails)
          )
        };
      }),
      storeConsent
    },
    actors: {
      checkBluetoothPermissions: fromPromise(checkBluetoothPermissions),
      checkBluetoothActivation: fromPromise(checkBluetoothActivation),
      checkNfcActivation: fromPromise(checkNfcActivation),
      proximityCommunicationLogic: fromCallback(() => () => {}),
      startEngagement: fromPromise(startEngagement),
      sendDocuments: fromPromise(sendDocuments),
      terminateSession: fromPromise(terminateSession)
    },
    guards: {
      hasFailure: ({ context }) => !!context.failure,
      hasGrantedConsent: ({ context }) => {
        if (!context.proximityDetails) {
          return false;
        }
        const consentData = getConsentDataFromProximityDetails(
          context.proximityDetails
        );
        const consentKey = generateConsentKey(consentData);
        return context.grantedConsentKey === consentKey;
      }
    }
  });

  const makeSnapshot = (
    value: MachineSnapshot["value"],
    context: Partial<MachineSnapshot["context"]> = {}
  ): MachineSnapshot => {
    const initialSnapshot = createActor(itwProximityMachine).getSnapshot();

    return _.merge(undefined, initialSnapshot, {
      value,
      context: {
        walletInstanceAttestation: T_WIA,
        credentials: T_CREDENTIALS,
        ...context
      }
    } as Partial<MachineSnapshot>) as MachineSnapshot;
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("initializes in Idle", () => {
    const actor = createActor(mockedMachine);

    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(onInit).toHaveBeenCalledTimes(1);
  });

  it("close from Idle is ignored", () => {
    const actor = createActor(mockedMachine);

    actor.start();
    actor.send({ type: "close" });

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(closeProximity).not.toHaveBeenCalled();
  });

  it("start moves to Bluetooth.CheckPermissions", () => {
    checkBluetoothPermissions.mockReturnValue(new Promise(() => {}));
    const actor = createActor(mockedMachine);

    actor.start();
    actor.send({ type: "start" });

    expect(actor.getSnapshot().value).toStrictEqual({
      Bluetooth: "CheckPermissions"
    });
  });

  it("granted bluetooth permissions move to Bluetooth.CheckActivation", async () => {
    checkBluetoothPermissions.mockResolvedValue(true);
    checkBluetoothActivation.mockReturnValue(new Promise(() => {}));
    const actor = createActor(mockedMachine);

    actor.start();
    actor.send({ type: "start" });

    await waitFor(actor, snapshot =>
      snapshot.matches({ Bluetooth: "CheckActivation" })
    );
  });

  it("denied bluetooth permissions move to Bluetooth.RequirePermissions", async () => {
    checkBluetoothPermissions.mockResolvedValue(false);
    const actor = createActor(mockedMachine);

    actor.start();
    actor.send({ type: "start" });

    await waitFor(actor, snapshot =>
      snapshot.matches({ Bluetooth: "RequirePermissions" })
    );
    expect(navigateToBluetoothPermissionsScreen).toHaveBeenCalledTimes(1);
  });

  it("bluetooth permissions errors move to Bluetooth.RequirePermissions", async () => {
    checkBluetoothPermissions.mockRejectedValue(
      new Error("permissions unavailable")
    );
    const actor = createActor(mockedMachine);

    actor.start();
    actor.send({ type: "start" });

    await waitFor(actor, snapshot =>
      snapshot.matches({ Bluetooth: "RequirePermissions" })
    );
    expect(navigateToBluetoothPermissionsScreen).toHaveBeenCalledTimes(1);
  });

  it("close from Bluetooth.RequirePermissions calls closeProximity", () => {
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot({ Bluetooth: "RequirePermissions" })
    });

    actor.start();
    actor.send({ type: "close" });

    expect(actor.getSnapshot().value).toStrictEqual({
      Bluetooth: "RequirePermissions"
    });
    expect(closeProximity).toHaveBeenCalledTimes(1);
  });

  it("continue from Bluetooth.RequirePermissions moves to Bluetooth.CheckActivation", async () => {
    checkBluetoothActivation.mockReturnValue(new Promise(() => {}));
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot({ Bluetooth: "RequirePermissions" })
    });

    actor.start();
    actor.send({ type: "continue" });

    await waitFor(actor, snapshot =>
      snapshot.matches({ Bluetooth: "CheckActivation" })
    );
  });

  it("active bluetooth moves to Presentment.Starting", async () => {
    checkBluetoothPermissions.mockResolvedValue(true);
    checkBluetoothActivation.mockResolvedValue(true);
    startEngagement.mockReturnValue(new Promise(() => {}));
    const actor = createActor(mockedMachine);

    actor.start();
    actor.send({ type: "start" });

    await waitFor(actor, snapshot =>
      snapshot.matches({ Presentment: "Starting" })
    );
  });

  it("inactive bluetooth moves to Bluetooth.RequireActivation", async () => {
    checkBluetoothPermissions.mockResolvedValue(true);
    checkBluetoothActivation.mockResolvedValue(false);
    const actor = createActor(mockedMachine);

    actor.start();
    actor.send({ type: "start" });

    await waitFor(actor, snapshot =>
      snapshot.matches({ Bluetooth: "RequireActivation" })
    );
    expect(navigateToBluetoothActivationScreen).toHaveBeenCalledTimes(1);
  });

  it("bluetooth activation errors move to Bluetooth.RequireActivation", async () => {
    checkBluetoothPermissions.mockResolvedValue(true);
    checkBluetoothActivation.mockRejectedValue(
      new Error("bluetooth unavailable")
    );
    const actor = createActor(mockedMachine);

    actor.start();
    actor.send({ type: "start" });

    await waitFor(actor, snapshot =>
      snapshot.matches({ Bluetooth: "RequireActivation" })
    );
    expect(navigateToBluetoothActivationScreen).toHaveBeenCalledTimes(1);
  });

  it("close from Bluetooth.RequireActivation calls closeProximity", () => {
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot({ Bluetooth: "RequireActivation" })
    });

    actor.start();
    actor.send({ type: "close" });

    expect(actor.getSnapshot().value).toStrictEqual({
      Bluetooth: "RequireActivation"
    });
    expect(closeProximity).toHaveBeenCalledTimes(1);
  });

  it("continue from Bluetooth.RequireActivation moves to Presentment.Starting", async () => {
    startEngagement.mockReturnValue(new Promise(() => {}));
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot({ Bluetooth: "RequireActivation" })
    });

    actor.start();
    actor.send({ type: "continue" });

    await waitFor(actor, snapshot =>
      snapshot.matches({ Presentment: "Starting" })
    );
  });

  it("start-nfc-presentment from AwaitingConnection enters Nfc gate", async () => {
    checkNfcActivation.mockReturnValue(new Promise(() => {}));
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot({ Presentment: "AwaitingConnection" })
    });

    actor.start();
    actor.send({ type: "start-nfc-presentment" });

    await waitFor(actor, snapshot =>
      snapshot.matches({ Nfc: "CheckActivation" })
    );
  });

  it("inactive NFC from start-nfc-presentment moves to Nfc.RequireActivation", async () => {
    checkNfcActivation.mockResolvedValue(false);
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot({ Presentment: "AwaitingConnection" })
    });

    actor.start();
    actor.send({ type: "start-nfc-presentment" });

    await waitFor(actor, snapshot =>
      snapshot.matches({ Nfc: "RequireActivation" })
    );
    expect(navigateToNfcActivationScreen).toHaveBeenCalledTimes(1);
  });

  it("NFC activation errors from start-nfc-presentment move to Nfc.RequireActivation", async () => {
    checkNfcActivation.mockRejectedValue(new Error("nfc unavailable"));
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot({ Presentment: "AwaitingConnection" })
    });

    actor.start();
    actor.send({ type: "start-nfc-presentment" });

    await waitFor(actor, snapshot =>
      snapshot.matches({ Nfc: "RequireActivation" })
    );
    expect(navigateToNfcActivationScreen).toHaveBeenCalledTimes(1);
  });

  it("close from Nfc.RequireActivation returns to Presentment", async () => {
    startEngagement.mockReturnValue(new Promise(() => {}));
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot({ Nfc: "RequireActivation" })
    });

    actor.start();
    actor.send({ type: "close" });

    await waitFor(actor, snapshot =>
      snapshot.matches({ Presentment: "Starting" })
    );
  });

  it("continue from Nfc.RequireActivation moves to Presentment.Starting with NFC mode", async () => {
    startEngagement.mockReturnValue(new Promise(() => {}));
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot({ Nfc: "RequireActivation" })
    });

    actor.start();
    actor.send({ type: "continue" });

    await waitFor(actor, snapshot =>
      snapshot.matches({ Presentment: "Starting" })
    );
    expect(actor.getSnapshot().context.engagementMode).toEqual("nfc");
    expect(navigateToNfcPresentmentScreen).toHaveBeenCalledTimes(1);
  });

  it("handles the happy path in Presentment", async () => {
    sendDocuments.mockReturnValue(new Promise(() => {}));
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot({ Presentment: "Starting" })
    });

    actor.start();

    actor.send({ type: "qr-code-string", payload: T_QR_CODE });
    expect(actor.getSnapshot().value).toStrictEqual({
      Presentment: "AwaitingConnection"
    });
    expect(actor.getSnapshot().context.qrCodeString).toEqual(T_QR_CODE);

    actor.send({ type: "device-connecting" });
    expect(actor.getSnapshot().value).toStrictEqual({
      Presentment: "Connecting"
    });

    actor.send({ type: "device-connected" });
    expect(actor.getSnapshot().value).toStrictEqual({
      Presentment: "Connected"
    });

    actor.send({
      type: "device-document-request-received",
      proximityDetails: T_PROXIMITY_DETAILS,
      verifierRequest: T_VERIFIER_REQUEST,
      retrievalMethod: "ble"
    });
    expect(actor.getSnapshot().value).toStrictEqual({
      Presentment: "ClaimsDisclosure"
    });
    expect(navigateToClaimsDisclosureScreen).toHaveBeenCalledTimes(2);
    expect(actor.getSnapshot().context.proximityDetails).toEqual(
      T_PROXIMITY_DETAILS
    );
    expect(actor.getSnapshot().context.verifierRequest).toEqual(
      T_VERIFIER_REQUEST
    );

    actor.send({ type: "holder-consent" });
    await waitFor(actor, snapshot =>
      snapshot.matches({ Presentment: "SendingDocuments" })
    );
    // BLE consent does not set grantedConsentKey: that field is only used to skip
    // the consent screen on NFC re-connections (see EvaluatingConsent).
    expect(actor.getSnapshot().context.grantedConsentKey).toBeUndefined();

    actor.send({ type: "device-disconnected" });
    expect(actor.getSnapshot().value).toStrictEqual("Success");
    expect(navigateToSuccessScreen).toHaveBeenCalledTimes(1);

    actor.send({ type: "close" });
    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(closeProximity).toHaveBeenCalledTimes(1);
  });

  it("device-connecting with QR engagement pre-navigates to claims disclosure", () => {
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot({ Presentment: "AwaitingConnection" })
    });

    actor.start();
    actor.send({ type: "device-connecting" });

    expect(actor.getSnapshot().value).toStrictEqual({
      Presentment: "Connecting"
    });
    expect(navigateToClaimsDisclosureScreen).toHaveBeenCalledTimes(1);
  });

  it("device-connecting with NFC engagement does not pre-navigate to claims disclosure", () => {
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot(
        { Presentment: "AwaitingConnection" },
        { engagementMode: "nfc" }
      )
    });

    actor.start();
    actor.send({ type: "device-connecting" });

    expect(actor.getSnapshot().value).toStrictEqual({
      Presentment: "Connecting"
    });
    expect(navigateToClaimsDisclosureScreen).not.toHaveBeenCalled();
  });

  it("close from Presentment.AwaitingConnection calls closeProximity", () => {
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot({ Presentment: "AwaitingConnection" })
    });

    actor.start();
    actor.send({ type: "close" });

    expect(actor.getSnapshot().value).toStrictEqual({
      Presentment: "AwaitingConnection"
    });
    expect(closeProximity).toHaveBeenCalledTimes(1);
  });

  it("holder-consent from ClaimsDisclosure moves to SendingDocuments", () => {
    sendDocuments.mockReturnValue(new Promise(() => {}));
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot(
        { Presentment: "ClaimsDisclosure" },
        { proximityDetails: T_PROXIMITY_DETAILS }
      )
    });

    actor.start();
    actor.send({ type: "holder-consent" });

    expect(actor.getSnapshot().value).toStrictEqual({
      Presentment: "SendingDocuments"
    });
  });

  it("sendDocuments errors move to Failure", async () => {
    sendDocuments.mockRejectedValue(new Error("send failed"));
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot(
        { Presentment: "ClaimsDisclosure" },
        { proximityDetails: T_PROXIMITY_DETAILS }
      )
    });

    actor.start();
    actor.send({ type: "holder-consent" });

    await waitFor(actor, snapshot => snapshot.matches("Failure"));
    expect(actor.getSnapshot().context.failure?.type).toEqual(
      ProximityFailureType.RELYING_PARTY_GENERIC
    );
    expect(navigateToFailureScreen).toHaveBeenCalledTimes(1);
  });

  it("device-disconnected before SendingDocuments terminates the session and closes the flow", async () => {
    terminateSession.mockResolvedValue(undefined);
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot({ Presentment: "AwaitingConnection" })
    });

    actor.start();
    actor.send({ type: "device-disconnected" });

    expect(actor.getSnapshot().value).toStrictEqual({
      Presentment: "Terminating"
    });
    expect(actor.getSnapshot().context.failure?.type).toEqual(
      ProximityFailureType.UNEXPECTED
    );
    // Allow the terminateProximitySession promise to resolve
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(closeProximity).toHaveBeenCalledTimes(1);
    expect(navigateToFailureScreen).not.toHaveBeenCalled();
  });

  it("device-disconnected in ClaimsDisclosure with NFC retrieval is consumed without failure", () => {
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot(
        { Presentment: "ClaimsDisclosure" },
        { retrievalMethod: "nfc" }
      )
    });

    actor.start();
    actor.send({ type: "device-disconnected" });

    // Machine stays in ClaimsDisclosure - the disconnect was expected
    expect(actor.getSnapshot().value).toStrictEqual({
      Presentment: "ClaimsDisclosure"
    });
    expect(actor.getSnapshot().context.failure).toBeUndefined();
    expect(navigateToFailureScreen).not.toHaveBeenCalled();
  });

  it("nfc-stopped from AwaitingConnection closes the proximity flow", () => {
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot({ Presentment: "AwaitingConnection" })
    });

    actor.start();
    actor.send({ type: "nfc-stopped" });

    expect(actor.getSnapshot().value).toStrictEqual({
      Presentment: "AwaitingConnection"
    });
    expect(closeProximity).toHaveBeenCalledTimes(1);
  });

  it("device-error moves to Failure", async () => {
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot({ Presentment: "AwaitingConnection" })
    });

    actor.start();
    actor.send({ type: "device-error", error: new Error("device error") });

    await waitFor(actor, snapshot => snapshot.matches("Failure"));
    expect(actor.getSnapshot().context.failure?.type).toEqual(
      ProximityFailureType.RELYING_PARTY_GENERIC
    );
    expect(navigateToFailureScreen).toHaveBeenCalledTimes(1);
  });

  it("close from ClaimsDisclosure terminates the session and closes the flow", async () => {
    terminateSession.mockResolvedValue(undefined);
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot({ Presentment: "ClaimsDisclosure" })
    });

    actor.start();
    actor.send({ type: "close" });

    expect(actor.getSnapshot().value).toStrictEqual({
      Presentment: "Terminating"
    });
    // Allow the terminateProximitySession promise to resolve
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(closeProximity).toHaveBeenCalledTimes(1);
  });

  it("holder-consent with NFC retrieval moves to StoreConsent", () => {
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot(
        { Presentment: "ClaimsDisclosure" },
        { retrievalMethod: "nfc", proximityDetails: T_PROXIMITY_DETAILS }
      )
    });

    actor.start();
    actor.send({ type: "holder-consent" });

    expect(actor.getSnapshot().value).toStrictEqual({
      Presentment: "StoreConsent"
    });
    expect(actor.getSnapshot().context.grantedConsentKey).toBe(
      generateConsentKey(
        getConsentDataFromProximityDetails(T_PROXIMITY_DETAILS)
      )
    );
    expect(navigateToStoreconsentScreen).toHaveBeenCalledTimes(1);
  });

  it("NFC document request without consent terminates the session before disclosing claims", async () => {
    terminateSession.mockResolvedValue(undefined);
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot(
        { Presentment: "Connected" },
        { engagementMode: "nfc" }
      )
    });

    actor.start();
    actor.send({
      type: "device-document-request-received",
      proximityDetails: T_PROXIMITY_DETAILS,
      verifierRequest: T_VERIFIER_REQUEST,
      retrievalMethod: "nfc"
    });

    await waitFor(actor, snapshot =>
      snapshot.matches({ Presentment: "ClaimsDisclosure" })
    );
    expect(terminateSession).toHaveBeenCalledTimes(1);
    expect(navigateToClaimsDisclosureScreen).toHaveBeenCalledTimes(1);
    expect(actor.getSnapshot().context.grantedConsentKey).toBeUndefined();
  });

  it("NFC termination failure still proceeds to claims disclosure", async () => {
    terminateSession.mockRejectedValue(new Error("terminate failed"));
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot(
        { Presentment: "Connected" },
        { engagementMode: "nfc" }
      )
    });

    actor.start();
    actor.send({
      type: "device-document-request-received",
      proximityDetails: T_PROXIMITY_DETAILS,
      verifierRequest: T_VERIFIER_REQUEST,
      retrievalMethod: "nfc"
    });

    await waitFor(actor, snapshot =>
      snapshot.matches({ Presentment: "ClaimsDisclosure" })
    );
    expect(actor.getSnapshot().context.failure).toBeUndefined();
    expect(navigateToFailureScreen).not.toHaveBeenCalled();
  });

  it("device-disconnected during NFC TerminatingForConsent is consumed without failure", async () => {
    // Never resolves: keep the machine parked in TerminatingForConsent
    terminateSession.mockReturnValue(new Promise(() => {}));
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot(
        { Presentment: "Connected" },
        { engagementMode: "nfc" }
      )
    });

    actor.start();
    actor.send({
      type: "device-document-request-received",
      proximityDetails: T_PROXIMITY_DETAILS,
      verifierRequest: T_VERIFIER_REQUEST,
      retrievalMethod: "nfc"
    });

    await waitFor(actor, snapshot =>
      snapshot.matches({ Presentment: "TerminatingForConsent" })
    );

    actor.send({ type: "device-disconnected" });

    expect(actor.getSnapshot().value).toStrictEqual({
      Presentment: "TerminatingForConsent"
    });
    expect(actor.getSnapshot().context.failure).toBeUndefined();
    expect(navigateToFailureScreen).not.toHaveBeenCalled();
  });

  it("device-error during NFC TerminatingForConsent is consumed without failure", async () => {
    // Never resolves: keep the machine parked in TerminatingForConsent
    terminateSession.mockReturnValue(new Promise(() => {}));
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot(
        { Presentment: "Connected" },
        { engagementMode: "nfc" }
      )
    });

    actor.start();
    actor.send({
      type: "device-document-request-received",
      proximityDetails: T_PROXIMITY_DETAILS,
      verifierRequest: T_VERIFIER_REQUEST,
      retrievalMethod: "nfc"
    });

    await waitFor(actor, snapshot =>
      snapshot.matches({ Presentment: "TerminatingForConsent" })
    );

    actor.send({
      type: "device-error",
      error: new Error("expected NFC teardown error")
    });

    expect(actor.getSnapshot().value).toStrictEqual({
      Presentment: "TerminatingForConsent"
    });
    expect(actor.getSnapshot().context.failure).toBeUndefined();
    expect(navigateToFailureScreen).not.toHaveBeenCalled();
  });

  it("device-error in ClaimsDisclosure with NFC retrieval is consumed without failure", () => {
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot(
        { Presentment: "ClaimsDisclosure" },
        { retrievalMethod: "nfc" }
      )
    });

    actor.start();
    actor.send({
      type: "device-error",
      error: new Error("expected NFC teardown error")
    });

    expect(actor.getSnapshot().value).toStrictEqual({
      Presentment: "ClaimsDisclosure"
    });
    expect(actor.getSnapshot().context.failure).toBeUndefined();
    expect(navigateToFailureScreen).not.toHaveBeenCalled();
  });

  it("NFC document request with prior consent sends documents without re-terminating", async () => {
    sendDocuments.mockReturnValue(new Promise(() => {}));
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot(
        { Presentment: "Connected" },
        {
          engagementMode: "nfc",
          grantedConsentKey: generateConsentKey(
            getConsentDataFromProximityDetails(T_PROXIMITY_DETAILS)
          )
        }
      )
    });

    actor.start();
    actor.send({
      type: "device-document-request-received",
      proximityDetails: T_PROXIMITY_DETAILS,
      verifierRequest: T_VERIFIER_REQUEST,
      retrievalMethod: "nfc"
    });

    await waitFor(actor, snapshot =>
      snapshot.matches({ Presentment: "SendingDocuments" })
    );
    expect(terminateSession).not.toHaveBeenCalled();
  });

  it("NFC document request with mismatched consent key goes through TerminatingForConsent and ClaimsDisclosure", async () => {
    terminateSession.mockResolvedValue(undefined);
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot(
        { Presentment: "Connected" },
        {
          engagementMode: "nfc",
          grantedConsentKey: generateConsentKey(
            getConsentDataFromProximityDetails(T_PROXIMITY_DETAILS)
          )
        }
      )
    });

    actor.start();
    actor.send({
      type: "device-document-request-received",
      proximityDetails: T_PROXIMITY_DETAILS_B,
      verifierRequest: T_VERIFIER_REQUEST,
      retrievalMethod: "nfc"
    });

    await waitFor(actor, snapshot =>
      snapshot.matches({ Presentment: "ClaimsDisclosure" })
    );
    expect(terminateSession).toHaveBeenCalledTimes(1);
    expect(sendDocuments).not.toHaveBeenCalled();
    expect(navigateToClaimsDisclosureScreen).toHaveBeenCalledTimes(1);
  });

  it("store-consent from StoreConsent stores consent and moves to Retrying", () => {
    startEngagement.mockReturnValue(new Promise(() => {}));
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot({ Presentment: "StoreConsent" })
    });

    actor.start();
    actor.send({ type: "store-consent" });

    expect(storeConsent).toHaveBeenCalledTimes(1);
    expect(actor.getSnapshot().value).toStrictEqual({
      Presentment: "Starting"
    });
  });

  it("continue from StoreConsent skips storing and moves to Retrying", () => {
    startEngagement.mockReturnValue(new Promise(() => {}));
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot({ Presentment: "StoreConsent" })
    });

    actor.start();
    actor.send({ type: "continue" });

    expect(storeConsent).not.toHaveBeenCalled();
    expect(actor.getSnapshot().value).toStrictEqual({
      Presentment: "Starting"
    });
  });

  it("retry from Starting clears the failure after a startEngagement error", async () => {
    const actor = createActor(mockedMachine);

    checkBluetoothPermissions.mockResolvedValue(true);
    checkBluetoothActivation.mockResolvedValue(true);
    startEngagement
      .mockRejectedValueOnce(new Error("start failed"))
      .mockReturnValueOnce(new Promise(() => {}));

    actor.start();
    actor.send({ type: "start" });

    await waitFor(actor, snapshot => !!snapshot.context.failure);
    expect(actor.getSnapshot().context.failure?.type).toEqual(
      ProximityFailureType.RELYING_PARTY_GENERIC
    );

    actor.send({ type: "retry" });

    await waitFor(
      actor,
      snapshot =>
        snapshot.matches({ Presentment: "Starting" }) &&
        snapshot.context.failure === undefined
    );
  });

  it("close from Failure returns to Idle", () => {
    const actor = createActor(mockedMachine, {
      snapshot: makeSnapshot("Failure")
    });

    actor.start();
    actor.send({ type: "close" });

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(closeProximity).toHaveBeenCalledTimes(1);
  });
});
