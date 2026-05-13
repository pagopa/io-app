import _ from "lodash";
import {
  StateFrom,
  createActor,
  fromCallback,
  fromPromise,
  waitFor
} from "xstate";
import { ItwProximityMachine, itwProximityMachine } from "../machine";
import { ProximityFailureType } from "../failure";
import {
  ProximityDetails,
  VerifierRequest
} from "../../utils/itwProximityTypeUtils";

type MachineSnapshot = StateFrom<ItwProximityMachine>;

const T_QR_CODE = "mdoc://...";
const T_PROXIMITY_DETAILS = [] as unknown as ProximityDetails;
const T_VERIFIER_REQUEST = {} as VerifierRequest;

describe("itwProximityMachine", () => {
  const onInit = jest.fn();
  const navigateToGrantPermissionsScreen = jest.fn();
  const navigateToBluetoothActivationScreen = jest.fn();
  const navigateToQrCodeScreen = jest.fn();
  const navigateToFailureScreen = jest.fn();
  const navigateToClaimsDisclosureScreen = jest.fn();
  const navigateToSendDocumentsResponseScreen = jest.fn();
  const navigateToWallet = jest.fn();
  const closeProximity = jest.fn();
  const trackQrCodeGenerationOutcome = jest.fn();

  const checkPermissions = jest.fn();
  const checkBluetoothIsActive = jest.fn();
  const startEngagement = jest.fn();
  const sendDocuments = jest.fn();
  const terminateProximitySession = jest.fn();
  const closeProximityFlow = jest.fn();

  const mockedMachine = itwProximityMachine.provide({
    actions: {
      onInit,
      navigateToGrantPermissionsScreen,
      navigateToBluetoothActivationScreen,
      navigateToQrCodeScreen,
      navigateToFailureScreen,
      navigateToClaimsDisclosureScreen,
      navigateToSendDocumentsResponseScreen,
      navigateToWallet,
      closeProximity,
      trackQrCodeGenerationOutcome
    },
    actors: {
      checkPermissions: fromPromise(checkPermissions),
      checkBluetoothIsActive: fromPromise(checkBluetoothIsActive),
      startEngagement: fromPromise(startEngagement),
      proximityCommunicationLogic: fromCallback(() => () => {}),
      sendDocuments: fromPromise(sendDocuments),
      terminateProximitySession: fromPromise(terminateProximitySession),
      closeProximityFlow: fromPromise(closeProximityFlow)
    },
    guards: {
      hasFailure: ({ context }) => !!context.failure
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("initializes in Idle", () => {
    const actor = createActor(mockedMachine);
    actor.start();
    expect(actor.getSnapshot().value).toStrictEqual("Idle");
  });

  it("start → Permissions.CheckingPermissions", () => {
    checkPermissions.mockReturnValue(new Promise(() => {})); // never resolves
    const actor = createActor(mockedMachine);
    actor.start();
    actor.send({ type: "start" });
    expect(actor.getSnapshot().value).toStrictEqual({
      Permissions: "CheckingPermissions"
    });
  });

  it("permissions granted → Bluetooth.CheckingBluetoothIsActive", async () => {
    checkPermissions.mockResolvedValue(true);
    checkBluetoothIsActive.mockReturnValue(new Promise(() => {}));
    const actor = createActor(mockedMachine);
    actor.start();
    actor.send({ type: "start" });
    await waitFor(actor, s =>
      s.matches({ Bluetooth: "CheckingBluetoothIsActive" })
    );
  });

  it("permissions denied → Permissions.GrantPermissions", async () => {
    checkPermissions.mockResolvedValue(false);
    const actor = createActor(mockedMachine);
    actor.start();
    actor.send({ type: "start" });
    await waitFor(actor, s => s.matches({ Permissions: "GrantPermissions" }));
    expect(navigateToGrantPermissionsScreen).toHaveBeenCalledTimes(1);
  });

  /**
   * Back from GrantPermissions closes the proximity presentation:
   * the machine returns to Idle and dispatches the closeProximity action.
   */
  it("GrantPermissions + back → Idle, closeProximity", async () => {
    checkPermissions.mockResolvedValue(false);
    const actor = createActor(mockedMachine);
    actor.start();
    actor.send({ type: "start" });
    await waitFor(actor, s => s.matches({ Permissions: "GrantPermissions" }));
    actor.send({ type: "back" });
    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(closeProximity).toHaveBeenCalledTimes(1);
  });

  /**
   * The screen verifies permissions before sending "continue", so the machine
   * trusts the event and proceeds directly to the Bluetooth check.
   */
  it("GrantPermissions + continue → Bluetooth.CheckingBluetoothIsActive", async () => {
    checkPermissions.mockResolvedValue(false);
    checkBluetoothIsActive.mockReturnValue(new Promise(() => {}));
    const actor = createActor(mockedMachine);
    actor.start();
    actor.send({ type: "start" });
    await waitFor(actor, s => s.matches({ Permissions: "GrantPermissions" }));
    actor.send({ type: "continue" });
    await waitFor(actor, s =>
      s.matches({ Bluetooth: "CheckingBluetoothIsActive" })
    );
  });

  it("Bluetooth active → Presentation.Starting", async () => {
    checkPermissions.mockResolvedValue(true);
    checkBluetoothIsActive.mockResolvedValue(true);
    startEngagement.mockReturnValue(new Promise(() => {}));
    const actor = createActor(mockedMachine);
    actor.start();
    actor.send({ type: "start" });
    await waitFor(actor, s => s.matches({ Presentation: "Starting" }));
  });

  it("Bluetooth inactive → Bluetooth.EnableBluetooth", async () => {
    checkPermissions.mockResolvedValue(true);
    checkBluetoothIsActive.mockResolvedValue(false);
    const actor = createActor(mockedMachine);
    actor.start();
    actor.send({ type: "start" });
    await waitFor(actor, s => s.matches({ Bluetooth: "EnableBluetooth" }));
    expect(navigateToBluetoothActivationScreen).toHaveBeenCalledTimes(1);
  });

  /**
   * Back from EnableBluetooth closes the proximity presentation:
   * the machine returns to Idle and dispatches the closeProximity action.
   */
  it("EnableBluetooth + back → Idle, closeProximity", async () => {
    checkPermissions.mockResolvedValue(true);
    checkBluetoothIsActive.mockResolvedValue(false);
    const actor = createActor(mockedMachine);
    actor.start();
    actor.send({ type: "start" });
    await waitFor(actor, s => s.matches({ Bluetooth: "EnableBluetooth" }));
    actor.send({ type: "back" });
    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(closeProximity).toHaveBeenCalledTimes(1);
  });

  /**
   * The screen verifies Bluetooth is on before sending "continue", so the
   * machine trusts the event and proceeds to the Presentation state.
   */
  it("EnableBluetooth + continue → Presentation.Starting", async () => {
    checkPermissions.mockResolvedValue(true);
    checkBluetoothIsActive.mockResolvedValue(false);
    startEngagement.mockReturnValue(new Promise(() => {}));
    const actor = createActor(mockedMachine);
    actor.start();
    actor.send({ type: "start" });
    await waitFor(actor, s => s.matches({ Bluetooth: "EnableBluetooth" }));
    actor.send({ type: "continue" });
    await waitFor(actor, s => s.matches({ Presentation: "Starting" }));
  });

  describe("Verifier events during Presentation", () => {
    const inPresentationSnapshot = (sub: string): MachineSnapshot => {
      const initial = createActor(itwProximityMachine).getSnapshot();
      return _.merge(undefined, initial, {
        value: { Presentation: sub }
      } as Partial<MachineSnapshot>);
    };

    it("qr-code-string → DisplayQrCode, stores qrCodeString", () => {
      const actor = createActor(mockedMachine, {
        snapshot: inPresentationSnapshot("Starting")
      });
      actor.start();
      actor.send({ type: "qr-code-string", payload: T_QR_CODE });
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toStrictEqual({ Presentation: "DisplayQrCode" });
      expect(snapshot.context.qrCodeString).toEqual(T_QR_CODE);
    });

    it("device-connecting → Presentation.Connecting", () => {
      const actor = createActor(mockedMachine, {
        snapshot: inPresentationSnapshot("DisplayQrCode")
      });
      actor.start();
      actor.send({ type: "device-connecting" });
      expect(actor.getSnapshot().value).toStrictEqual({
        Presentation: "Connecting"
      });
    });

    it("device-connected → Presentation.Connected, navigates to claims disclosure", () => {
      const actor = createActor(mockedMachine, {
        snapshot: inPresentationSnapshot("Connecting")
      });
      actor.start();
      actor.send({ type: "device-connected" });
      expect(actor.getSnapshot().value).toStrictEqual({
        Presentation: "Connected"
      });
      expect(navigateToClaimsDisclosureScreen).toHaveBeenCalledTimes(1);
    });

    it("device-document-request-received → ClaimsDisclosure, stores details", () => {
      const actor = createActor(mockedMachine, {
        snapshot: inPresentationSnapshot("Connected")
      });
      actor.start();
      actor.send({
        type: "device-document-request-received",
        proximityDetails: T_PROXIMITY_DETAILS,
        verifierRequest: T_VERIFIER_REQUEST
      });
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toStrictEqual({
        Presentation: "ClaimsDisclosure"
      });
      expect(snapshot.context.proximityDetails).toEqual(T_PROXIMITY_DETAILS);
      expect(snapshot.context.verifierRequest).toEqual(T_VERIFIER_REQUEST);
    });

    it("holder-consent → SendingDocuments, navigates to send documents screen", () => {
      sendDocuments.mockReturnValue(new Promise(() => {}));
      const actor = createActor(mockedMachine, {
        snapshot: inPresentationSnapshot("ClaimsDisclosure")
      });
      actor.start();
      actor.send({ type: "holder-consent" });
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toStrictEqual({
        Presentation: { SendingDocuments: "Initial" }
      });
      expect(snapshot.context.hasGivenConsent).toBe(true);
      expect(navigateToSendDocumentsResponseScreen).toHaveBeenCalledTimes(1);
    });

    it("device-disconnected while SendingDocuments → Success", async () => {
      sendDocuments.mockReturnValue(new Promise(() => {}));
      const actor = createActor(mockedMachine, {
        snapshot: inPresentationSnapshot("ClaimsDisclosure")
      });
      actor.start();
      actor.send({ type: "holder-consent" });
      await waitFor(actor, s =>
        s.matches({ Presentation: { SendingDocuments: "Initial" } })
      );
      actor.send({ type: "device-disconnected" });
      expect(actor.getSnapshot().value).toStrictEqual("Success");
    });

    it("device-disconnected before SendingDocuments → Terminating", async () => {
      terminateProximitySession.mockReturnValue(new Promise(() => {}));
      const actor = createActor(mockedMachine, {
        snapshot: inPresentationSnapshot("DisplayQrCode")
      });
      actor.start();
      actor.send({ type: "device-disconnected" });
      await waitFor(actor, s => s.matches({ Presentation: "Terminating" }));
      expect(actor.getSnapshot().context.failure).toBeDefined();
    });

    it("device-error → Terminating with failure → Failure", async () => {
      const error = new Error("device error");
      terminateProximitySession.mockResolvedValue(undefined);
      const actor = createActor(mockedMachine, {
        snapshot: inPresentationSnapshot("DisplayQrCode")
      });
      actor.start();
      actor.send({ type: "device-error", error });
      await waitFor(actor, s => s.matches("Failure"));
      const snapshot = actor.getSnapshot();
      expect(snapshot.context.failure?.type).toEqual(
        ProximityFailureType.RELYING_PARTY_GENERIC
      );
      expect(navigateToFailureScreen).toHaveBeenCalledTimes(1);
    });

    it("back from ClaimsDisclosure → Terminating", async () => {
      terminateProximitySession.mockReturnValue(new Promise(() => {}));
      const actor = createActor(mockedMachine, {
        snapshot: inPresentationSnapshot("ClaimsDisclosure")
      });
      actor.start();
      actor.send({ type: "back" });
      await waitFor(actor, s => s.matches({ Presentation: "Terminating" }));
    });
  });

  describe("startEngagement outcome tracking", () => {
    // Use a deferred promise to wait until the action is called,
    // since startEngagement's onDone/onError have no target (no state change to waitFor).
    const whenTracked = () =>
      new Promise<void>(resolve => {
        trackQrCodeGenerationOutcome.mockImplementation(resolve);
      });

    it("success → trackQrCodeGenerationOutcome called with no failure in context", async () => {
      const tracked = whenTracked();
      checkPermissions.mockResolvedValue(true);
      checkBluetoothIsActive.mockResolvedValue(true);
      startEngagement.mockResolvedValue(undefined);
      const actor = createActor(mockedMachine);
      actor.start();
      actor.send({ type: "start" });
      await tracked;
      expect(trackQrCodeGenerationOutcome).toHaveBeenCalledTimes(1);
      expect(actor.getSnapshot().context.failure).toBeUndefined();
    });

    it("failure → setFailure, then trackQrCodeGenerationOutcome called with failure in context", async () => {
      const tracked = whenTracked();
      checkPermissions.mockResolvedValue(true);
      checkBluetoothIsActive.mockResolvedValue(true);
      startEngagement.mockRejectedValue(new Error("start failed"));
      const actor = createActor(mockedMachine);
      actor.start();
      actor.send({ type: "start" });
      await tracked;
      expect(trackQrCodeGenerationOutcome).toHaveBeenCalledTimes(1);
      expect(actor.getSnapshot().context.failure?.type).toEqual(
        ProximityFailureType.RELYING_PARTY_GENERIC
      );
    });
  });

  it("Success + close → Idle, navigateToWallet", () => {
    const initial = createActor(itwProximityMachine).getSnapshot();
    const actor = createActor(mockedMachine, {
      snapshot: _.merge(undefined, initial, {
        value: "Success"
      } as Partial<MachineSnapshot>)
    });
    actor.start();
    actor.send({ type: "close" });
    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(navigateToWallet).toHaveBeenCalledTimes(1);
  });

  it("Failure + close → Idle, closeProximity", () => {
    const initial = createActor(itwProximityMachine).getSnapshot();
    const actor = createActor(mockedMachine, {
      snapshot: _.merge(undefined, initial, {
        value: "Failure"
      } as Partial<MachineSnapshot>)
    });
    actor.start();
    actor.send({ type: "close" });
    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(closeProximity).toHaveBeenCalledTimes(1);
  });

  it("retry from Starting → Retrying → Starting, clears failure", async () => {
    startEngagement.mockReturnValue(new Promise(() => {}));
    const initial = createActor(itwProximityMachine).getSnapshot();
    const actor = createActor(mockedMachine, {
      snapshot: _.merge(undefined, initial, {
        value: { Presentation: "Starting" },
        context: {
          failure: {
            type: ProximityFailureType.UNEXPECTED,
            reason: new Error()
          }
        }
      } as Partial<MachineSnapshot>)
    });
    actor.start();
    actor.send({ type: "retry" });
    await waitFor(actor, s => s.matches({ Presentation: "Starting" }));
    expect(actor.getSnapshot().context.failure).toBeUndefined();
  });
});
