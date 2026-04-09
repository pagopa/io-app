import { waitFor } from "@testing-library/react-native";
import { createActor, fromCallback, fromPromise, SimulatedClock } from "xstate";
import { itwProximityMachine } from "../machine/machine";
import {
  CheckPermissionsInput,
  CloseActorOutput,
  SendDocumentsActorInput,
  SendDocumentsActorOutput,
  SendErrorResponseActorOutput
} from "../machine/actors";
import { ProximityEvents } from "../machine/events";
import { ItwTags } from "../../../machine/tags";
import { ItwPresentationTags } from "../machine/tags";
import type { VerifierRequest } from "../utils/itwProximityTypeUtils";

const QR_CODE_STRING = "test-qr-code-data";
const CREDENTIAL_TYPE = "org.iso.18013.5.1.mDL";

const PROXIMITY_DETAILS = [
  {
    credentialType: CREDENTIAL_TYPE,
    claimsToDisplay: [
      { id: "given_name", label: "Name", value: "John" },
      { id: "family_name", label: "FamilyName", value: "Doe" }
    ]
  }
];

const VERIFIER_REQUEST = {
  request: {
    [CREDENTIAL_TYPE]: {
      isAuthenticated: true,
      given_name: true,
      family_name: true,
      birth_date: false
    }
  }
} as unknown as VerifierRequest;

describe("itwProximityMachine", () => {
  const setFailure = jest.fn();
  const setHasGivenConsent = jest.fn();
  const navigateToGrantPermissionsScreen = jest.fn();
  const navigateToBluetoothActivationScreen = jest.fn();
  const navigateToQrCodeScreen = jest.fn();
  const navigateToFailureScreen = jest.fn();
  const navigateToClaimsDisclosureScreen = jest.fn();
  const navigateToSendDocumentsResponseScreen = jest.fn();
  const navigateToWallet = jest.fn();
  const closeProximity = jest.fn();

  const checkPermissions = jest.fn();
  const checkBluetoothIsActive = jest.fn();
  const startEngagement = jest.fn();
  const closeProximityFlow = jest.fn();
  const proximityCommunicationLogic = jest.fn();
  const terminateProximitySession = jest.fn();
  const sendDocuments = jest.fn();

  const hasFailure = jest.fn();

  const mockedMachine = itwProximityMachine.provide({
    actions: {
      setFailure,
      setHasGivenConsent,
      navigateToGrantPermissionsScreen,
      navigateToBluetoothActivationScreen,
      navigateToQrCodeScreen,
      navigateToFailureScreen,
      navigateToClaimsDisclosureScreen,
      navigateToSendDocumentsResponseScreen,
      navigateToWallet,
      closeProximity
    },
    actors: {
      checkPermissions: fromPromise<boolean, CheckPermissionsInput>(
        checkPermissions
      ),
      checkBluetoothIsActive: fromPromise<boolean, void>(
        checkBluetoothIsActive
      ),
      startEngagement: fromPromise(startEngagement),
      closeProximityFlow: fromPromise<CloseActorOutput, void>(
        closeProximityFlow
      ),
      proximityCommunicationLogic: fromCallback<ProximityEvents>(
        proximityCommunicationLogic
      ),
      terminateProximitySession: fromPromise<SendErrorResponseActorOutput>(
        terminateProximitySession
      ),
      sendDocuments: fromPromise<
        SendDocumentsActorOutput,
        SendDocumentsActorInput
      >(sendDocuments)
    },
    guards: {
      hasFailure
    }
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize correctly", () => {
      const actor = createActor(mockedMachine);
      actor.start();

      expect(actor.getSnapshot().value).toStrictEqual("Idle");
    });
  });

  describe("Permissions Flow", () => {
    it("should proceed to bluetooth when permissions are granted on retry", async () => {
      // Initial check fails and then silent check succeeds
      checkPermissions
        .mockImplementationOnce(() => Promise.resolve(false))
        .mockImplementationOnce(() => Promise.resolve(true));

      checkBluetoothIsActive.mockImplementation(() => Promise.resolve(false));

      const actor = createActor(mockedMachine);
      actor.start();
      actor.send({ type: "start" });

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Permissions: "GrantPermissions"
        })
      );

      expect(navigateToGrantPermissionsScreen).toHaveBeenCalled();

      actor.send({ type: "continue" });

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Permissions: "CheckPermissionsSilently"
        })
      );

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Bluetooth: "EnableBluetooth"
        })
      );

      expect(navigateToBluetoothActivationScreen).toHaveBeenCalled();

      expect(checkPermissions).toHaveBeenCalledTimes(2);
      expect(checkBluetoothIsActive).toHaveBeenCalledTimes(1);
    });

    it("should show PermissionsRequired after user denies permissions twice and handle close", async () => {
      // Mock checkPermissions to return false for both calls (initial and silent check)
      checkPermissions.mockImplementation(() => Promise.resolve(false));

      const actor = createActor(mockedMachine);
      actor.start();
      actor.send({ type: "start" });

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Permissions: "GrantPermissions"
        })
      );
      expect(navigateToGrantPermissionsScreen).toHaveBeenCalled();

      actor.send({ type: "continue" });

      expect(actor.getSnapshot().tags).toStrictEqual(
        new Set([ItwTags.Loading])
      );

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Permissions: "CheckPermissionsSilently"
        })
      );

      expect(actor.getSnapshot().tags).toStrictEqual(new Set());

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Permissions: "PermissionsRequired"
        })
      );

      actor.send({ type: "close" });

      expect(actor.getSnapshot().value).toStrictEqual("Idle");

      expect(checkPermissions).toHaveBeenCalledTimes(2);
    });

    it("should handle permission check errors", async () => {
      checkPermissions.mockImplementation(() =>
        Promise.reject(new Error("Permission error"))
      );

      const actor = createActor(mockedMachine);
      actor.start();
      actor.send({ type: "start" });

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Permissions: "GrantPermissions"
        })
      );

      expect(navigateToGrantPermissionsScreen).toHaveBeenCalled();

      actor.send({ type: "back" });

      expect(actor.getSnapshot().value).toStrictEqual("Idle");

      expect(setFailure).not.toHaveBeenCalled();
      expect(navigateToFailureScreen).not.toHaveBeenCalled();
    });
  });

  describe("Bluetooth Flow", () => {
    beforeEach(() => {
      checkPermissions.mockImplementation(() => Promise.resolve(true));
    });

    it("should proceed to presentation when bluetooth enabled on retry", async () => {
      checkBluetoothIsActive
        .mockImplementationOnce(() => Promise.resolve(false))
        .mockImplementationOnce(() => Promise.resolve(true));

      const actor = createActor(mockedMachine);
      actor.start();
      actor.send({ type: "start" });

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Bluetooth: "EnableBluetooth"
        })
      );

      expect(actor.getSnapshot().tags).toStrictEqual(new Set());
      expect(navigateToBluetoothActivationScreen).toHaveBeenCalled();

      actor.send({ type: "continue" });

      expect(actor.getSnapshot().tags).toStrictEqual(
        new Set([ItwTags.Loading])
      );

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Bluetooth: "CheckingBluetoothIsActiveSilently"
        })
      );

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Presentation: "Starting"
        })
      );

      expect(checkBluetoothIsActive).toHaveBeenCalledTimes(2);
    });

    it("should show BluetoothRequired after bluetooth denied twice and handle close", async () => {
      checkBluetoothIsActive.mockImplementation(() => Promise.resolve(false));

      const actor = createActor(mockedMachine);
      actor.start();
      actor.send({ type: "start" });

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Bluetooth: "EnableBluetooth"
        })
      );

      expect(navigateToBluetoothActivationScreen).toHaveBeenCalled();

      actor.send({ type: "continue" });

      expect(actor.getSnapshot().tags).toStrictEqual(
        new Set([ItwTags.Loading])
      );

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Bluetooth: "CheckingBluetoothIsActiveSilently"
        })
      );

      expect(actor.getSnapshot().tags).toStrictEqual(new Set());

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Bluetooth: "BluetoothRequired"
        })
      );

      actor.send({ type: "close" });

      expect(actor.getSnapshot().value).toStrictEqual("Idle");

      expect(checkBluetoothIsActive).toHaveBeenCalledTimes(2);

      expect(setFailure).not.toHaveBeenCalled();
      expect(navigateToFailureScreen).not.toHaveBeenCalled();
    });

    it("should handle bluetooth service errors and allow user interaction", async () => {
      checkBluetoothIsActive.mockImplementation(() =>
        Promise.reject(new Error("Bluetooth service unavailable"))
      );

      const actor = createActor(mockedMachine);
      actor.start();
      actor.send({ type: "start" });

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Bluetooth: "EnableBluetooth"
        })
      );

      expect(navigateToBluetoothActivationScreen).toHaveBeenCalled();

      actor.send({ type: "back" });

      expect(actor.getSnapshot().value).toStrictEqual("Idle");

      expect(setFailure).not.toHaveBeenCalled();
      expect(navigateToFailureScreen).not.toHaveBeenCalled();
    });
  });

  describe("Presentation Flow", () => {
    beforeEach(() => {
      checkPermissions.mockImplementation(() => Promise.resolve(true));
      checkBluetoothIsActive.mockImplementation(() => Promise.resolve(true));
    });

    it("should display QR code when engagement starts and qr-code-string event is received", async () => {
      const actor = createActor(mockedMachine);
      actor.start();
      actor.send({ type: "start" });

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Presentation: "Starting"
        })
      );

      expect(actor.getSnapshot().hasTag(ItwPresentationTags.Loading)).toBe(
        true
      );

      actor.send({ type: "qr-code-string", payload: QR_CODE_STRING });

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Presentation: "DisplayQrCode"
        })
      );

      expect(actor.getSnapshot().context.qrCodeString).toBe(QR_CODE_STRING);
      expect(actor.getSnapshot().hasTag(ItwPresentationTags.Presenting)).toBe(
        true
      );
    });

    it("should call setFailure and stay in Starting when startEngagement fails", async () => {
      startEngagement.mockImplementation(() =>
        Promise.reject(new Error("Engagement error"))
      );

      const actor = createActor(mockedMachine);
      actor.start();
      actor.send({ type: "start" });

      await waitFor(() => expect(setFailure).toHaveBeenCalled());

      expect(actor.getSnapshot().value).toStrictEqual({
        Presentation: "Starting"
      });
      expect(actor.getSnapshot().hasTag(ItwPresentationTags.Loading)).toBe(
        true
      );
      expect(navigateToFailureScreen).not.toHaveBeenCalled();
    });

    it("should restart engagement via Retrying state when retry event is sent after failure", async () => {
      startEngagement
        .mockImplementationOnce(() =>
          Promise.reject(new Error("Engagement error"))
        )
        .mockResolvedValueOnce(undefined);

      const actor = createActor(mockedMachine);
      actor.start();
      actor.send({ type: "start" });

      await waitFor(() => expect(setFailure).toHaveBeenCalledTimes(1));

      actor.send({ type: "retry" });

      // Passes through Retrying (always → Starting), startEngagement runs again
      await waitFor(() => expect(startEngagement).toHaveBeenCalledTimes(2));

      expect(actor.getSnapshot().value).toStrictEqual({
        Presentation: "Starting"
      });

      actor.send({ type: "qr-code-string", payload: QR_CODE_STRING });

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Presentation: "DisplayQrCode"
        })
      );
    });
  });

  describe("Device Communication Flow", () => {
    beforeEach(() => {
      checkPermissions.mockImplementation(() => Promise.resolve(true));
      checkBluetoothIsActive.mockImplementation(() => Promise.resolve(true));
      startEngagement.mockResolvedValue(undefined);
    });

    const startAndReachDisplayQrCode = async (
      actor: ReturnType<typeof createActor<typeof mockedMachine>>
    ) => {
      actor.start();
      actor.send({ type: "start" });

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Presentation: "Starting"
        })
      );

      actor.send({ type: "qr-code-string", payload: QR_CODE_STRING });

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Presentation: "DisplayQrCode"
        })
      );
    };

    it("should complete full device communication flow from QR display to successful document transmission", async () => {
      sendDocuments.mockImplementation(() =>
        Promise.resolve({ success: true })
      );

      const actor = createActor(mockedMachine);
      await startAndReachDisplayQrCode(actor);

      expect(actor.getSnapshot().tags).toStrictEqual(
        new Set([ItwPresentationTags.Presenting])
      );

      actor.send({ type: "device-connecting" });

      expect(actor.getSnapshot().value).toStrictEqual({
        Presentation: "Connecting"
      });

      actor.send({ type: "device-connected" });

      expect(actor.getSnapshot().value).toStrictEqual({
        Presentation: "Connected"
      });

      expect(navigateToClaimsDisclosureScreen).toHaveBeenCalled();

      actor.send({
        type: "device-document-request-received",
        proximityDetails: PROXIMITY_DETAILS,
        verifierRequest: VERIFIER_REQUEST
      });

      expect(actor.getSnapshot().value).toStrictEqual({
        Presentation: "ClaimsDisclosure"
      });

      expect(actor.getSnapshot().context.proximityDetails).toEqual(
        PROXIMITY_DETAILS
      );
      expect(actor.getSnapshot().context.verifierRequest).toEqual(
        VERIFIER_REQUEST
      );

      actor.send({ type: "holder-consent" });

      expect(navigateToSendDocumentsResponseScreen).toHaveBeenCalled();

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Presentation: {
            SendingDocuments: "Initial"
          }
        })
      );

      // This event is dispatched when the verifier sends the END (0x02) termination flag after sendDocuments.
      actor.send({ type: "device-disconnected" });

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual("Success")
      );

      expect(actor.getSnapshot().tags).toStrictEqual(new Set());

      expect(navigateToClaimsDisclosureScreen).toHaveBeenCalledTimes(1);
      expect(navigateToSendDocumentsResponseScreen).toHaveBeenCalledTimes(1);
    });

    it("should progress through SendingDocuments timeout states when transmission hangs", async () => {
      sendDocuments.mockImplementation(() => new Promise(() => {}));

      const clock = new SimulatedClock();
      const actor = createActor(mockedMachine, { clock });
      await startAndReachDisplayQrCode(actor);

      actor.send({ type: "device-connecting" });
      actor.send({ type: "device-connected" });
      actor.send({
        type: "device-document-request-received",
        proximityDetails: PROXIMITY_DETAILS,
        verifierRequest: VERIFIER_REQUEST
      });
      actor.send({ type: "holder-consent" });

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Presentation: {
            SendingDocuments: "Initial"
          }
        })
      );

      clock.increment(5000);
      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Presentation: {
            SendingDocuments: "Reminder"
          }
        })
      );

      clock.increment(10000);
      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Presentation: {
            SendingDocuments: "Final"
          }
        })
      );

      expect(sendDocuments).toHaveBeenCalledTimes(1);
    });

    it("should handle user rejection during claims disclosure", async () => {
      terminateProximitySession.mockImplementation(() =>
        Promise.resolve({ success: true })
      );

      const actor = createActor(mockedMachine, {});
      await startAndReachDisplayQrCode(actor);

      actor.send({ type: "device-connecting" });
      actor.send({ type: "device-connected" });
      actor.send({
        type: "device-document-request-received",
        proximityDetails: PROXIMITY_DETAILS,
        verifierRequest: VERIFIER_REQUEST
      });

      expect(actor.getSnapshot().value).toStrictEqual({
        Presentation: "ClaimsDisclosure"
      });

      actor.send({ type: "back" });

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Presentation: "Terminating"
        })
      );

      expect(terminateProximitySession).toHaveBeenCalled();
      expect(closeProximity).toHaveBeenCalled();

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual("Idle")
      );

      expect(sendDocuments).not.toHaveBeenCalled();
      expect(navigateToFailureScreen).not.toHaveBeenCalled();
      expect(setFailure).not.toHaveBeenCalled();

      expect(terminateProximitySession).toHaveBeenCalledTimes(1);
      expect(closeProximity).toHaveBeenCalledTimes(1);
    });

    it("should handle device connection errors and show failure screen", async () => {
      hasFailure.mockImplementation(() => true);

      const actor = createActor(mockedMachine);
      await startAndReachDisplayQrCode(actor);

      expect(actor.getSnapshot().hasTag("Presenting")).toBe(true);

      const deviceError = new Error("Device connection failed");
      actor.send({ type: "device-error", error: deviceError });

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Presentation: "Terminating"
        })
      );

      expect(terminateProximitySession).toHaveBeenCalled();

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual("Failure")
      );

      expect(navigateToFailureScreen).toHaveBeenCalled();
    });
  });
});
