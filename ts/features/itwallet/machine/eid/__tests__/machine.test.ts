import { waitFor } from "@testing-library/react-native";
import _ from "lodash";
import { createActor, fromPromise, StateFrom } from "xstate5";
import { idps } from "../../../../../utils/idps";
import { WalletAttestationResult } from "../../../common/utils/itwAttestationUtils";
import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { ItwTags } from "../../tags";
import {
  GetWalletAttestationActorParams,
  RequestEidActorParams,
  StartCieAuthFlowActorParams
} from "../actors";
import { CieAuthContext, Context, InitialContext } from "../context";
import { ItwEidIssuanceMachine, itwEidIssuanceMachine } from "../machine";

type MachineSnapshot = StateFrom<ItwEidIssuanceMachine>;

const T_INTEGRITY_KEY = "abc";
const T_WIA_CONTEXT: WalletAttestationResult = {
  walletAttestation: "abcdefg",
  wiaCryptoContext: {
    getPublicKey: async () => null,
    getSignature: async () => ""
  }
};

describe("itwEidIssuanceMachine", () => {
  const navigateToTosScreen = jest.fn();
  const navigateToIdentificationModeScreen = jest.fn();
  const navigateToIdpSelectionScreen = jest.fn();
  const navigateToEidPreviewScreen = jest.fn();
  const navigateToSuccessScreen = jest.fn();
  const navigateToFailureScreen = jest.fn();
  const navigateToWallet = jest.fn();
  const navigateToCredentialCatalog = jest.fn();
  const navigateToCiePinScreen = jest.fn();
  const navigateToCieReadCardScreen = jest.fn();
  const navigateToNfcInstructionsScreen = jest.fn();
  const storeIntegrityKeyTag = jest.fn();
  const storeEidCredential = jest.fn();
  const closeIssuance = jest.fn();
  const setWalletInstanceToOperational = jest.fn();
  const setWalletInstanceToValid = jest.fn();
  const disposeWalletAttestation = jest.fn();
  const handleSessionExpired = jest.fn();

  const createWalletInstance = jest.fn();
  const getWalletAttestation = jest.fn();
  const requestEid = jest.fn();
  const startCieAuthFlow = jest.fn();

  const isNativeAuthSessionClosed = jest.fn();
  const issuedEidMatchesAuthenticatedUser = jest.fn();
  const isSessionExpired = jest.fn();

  const mockedMachine = itwEidIssuanceMachine.provide({
    actions: {
      navigateToTosScreen,
      navigateToIdentificationModeScreen,
      navigateToIdpSelectionScreen,
      navigateToEidPreviewScreen,
      navigateToSuccessScreen,
      navigateToFailureScreen,
      navigateToWallet,
      navigateToCredentialCatalog,
      navigateToCiePinScreen,
      navigateToCieReadCardScreen,
      navigateToNfcInstructionsScreen,
      storeIntegrityKeyTag,
      storeEidCredential,
      closeIssuance,
      setWalletInstanceToOperational,
      setWalletInstanceToValid,
      disposeWalletAttestation,
      handleSessionExpired
    },
    actors: {
      createWalletInstance: fromPromise<string>(createWalletInstance),
      getWalletAttestation: fromPromise<
        WalletAttestationResult,
        GetWalletAttestationActorParams
      >(getWalletAttestation),
      requestEid: fromPromise<StoredCredential, RequestEidActorParams>(
        requestEid
      ),
      startCieAuthFlow: fromPromise<
        CieAuthContext,
        StartCieAuthFlowActorParams
      >(startCieAuthFlow)
    },
    guards: {
      isNativeAuthSessionClosed,
      issuedEidMatchesAuthenticatedUser,
      isSessionExpired
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should obtain an eID (SPID)", async () => {
    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    /**
     * Start eID issuance
     */

    actor.send({ type: "start" });

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToTosScreen).toHaveBeenCalledTimes(1);

    /**
     * Accept TOS and request WIA
     */

    createWalletInstance.mockImplementation(() =>
      Promise.resolve(T_INTEGRITY_KEY)
    );
    getWalletAttestation.mockImplementation(() =>
      Promise.resolve(T_WIA_CONTEXT)
    );

    actor.send({ type: "accept-tos" });

    expect(actor.getSnapshot().value).toStrictEqual("WalletInstanceCreation");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(createWalletInstance).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getWalletAttestation).toHaveBeenCalledTimes(1));

    // Wallet instance creation and attestation obtainment success

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: "ModeSelection"
    });
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      integrityKeyTag: T_INTEGRITY_KEY,
      walletAttestationContext: T_WIA_CONTEXT
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    /**
     * Choose SPID as identification mode
     */

    actor.send({ type: "select-identification-mode", mode: "spid" });

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: "Spid"
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToIdpSelectionScreen).toHaveBeenCalledTimes(1);

    /**
     * Choose first IDP in list for SPID identification
     */

    requestEid.mockImplementation(() =>
      Promise.resolve(ItwStoredCredentialsMocks.eid)
    );
    issuedEidMatchesAuthenticatedUser.mockImplementation(() => true);

    actor.send({ type: "select-spid-idp", idp: idps[0] });

    expect(actor.getSnapshot().value).toStrictEqual({
      Issuance: "RequestingEid"
    });
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      integrityKeyTag: T_INTEGRITY_KEY,
      walletAttestationContext: T_WIA_CONTEXT,
      identification: {
        mode: "spid",
        idpId: idps[0].id
      }
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));

    // EID obtained

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual({
        Issuance: "DisplayingPreview"
      })
    );
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      integrityKeyTag: T_INTEGRITY_KEY,
      walletAttestationContext: T_WIA_CONTEXT,
      identification: {
        mode: "spid",
        idpId: idps[0].id
      },
      eid: ItwStoredCredentialsMocks.eid
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToEidPreviewScreen).toHaveBeenCalledTimes(1);

    /**
     * Add to wallet
     */

    actor.send({ type: "add-to-wallet" });

    expect(actor.getSnapshot().value).toStrictEqual("Success");
    expect(storeEidCredential).toHaveBeenCalledTimes(1);
    expect(setWalletInstanceToValid).toHaveBeenCalledTimes(1);
    expect(disposeWalletAttestation).toHaveBeenCalledTimes(1);
    expect(navigateToSuccessScreen).toHaveBeenCalledTimes(1);

    /**
     * Go to wallet
     */

    actor.send({ type: "go-to-wallet" });

    expect(navigateToWallet).toHaveBeenCalledTimes(1);
  });

  it("Should obtain an eID (CieID)", () => {
    /** Initial part is the same as the previous test, we can start from the identification */

    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(initialSnapshot, {
      value: { UserIdentification: "ModeSelection" },
      context: {
        integrityKeyTag: T_INTEGRITY_KEY,
        walletAttestationContext: T_WIA_CONTEXT
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    /**
     * Choose CieID as identification mode
     */

    actor.send({ type: "select-identification-mode", mode: "cieId" });

    expect(actor.getSnapshot().value).toStrictEqual({
      Issuance: "RequestingEid"
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      integrityKeyTag: T_INTEGRITY_KEY,
      walletAttestationContext: T_WIA_CONTEXT,
      identification: {
        mode: "cieId"
      }
    });
    expect(navigateToEidPreviewScreen).toHaveBeenCalledTimes(1);

    /** Last part is the same as the previous test */
  });

  it("Should obtain an eID (Cie+PIN)", async () => {
    /** Initial part is the same as the previous test, we can start from the identification */

    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(initialSnapshot, {
      value: { UserIdentification: "ModeSelection" },
      context: {
        integrityKeyTag: T_INTEGRITY_KEY,
        walletAttestationContext: T_WIA_CONTEXT
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    /**
     * Choose Cie+PIN as identification mode
     */

    actor.send({ type: "select-identification-mode", mode: "ciePin" });

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: {
        CiePin: "InsertingCardPin"
      }
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      integrityKeyTag: T_INTEGRITY_KEY,
      walletAttestationContext: T_WIA_CONTEXT,
      identification: undefined
    });
    expect(navigateToCiePinScreen).toHaveBeenCalledTimes(1);

    /**
     * Enter pin
     */

    startCieAuthFlow.mockImplementation(() => Promise.resolve({}));

    actor.send({
      type: "cie-pin-entered",
      pin: "12345678",
      isNfcEnabled: true
    });

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: {
        CiePin: "StartingCieAuthFlow"
      }
    });
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      integrityKeyTag: T_INTEGRITY_KEY,
      walletAttestationContext: T_WIA_CONTEXT,
      identification: {
        mode: "ciePin",
        pin: "12345678"
      }
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(startCieAuthFlow).toHaveBeenCalledTimes(1));

    // Auth flow started

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: {
        CiePin: "ReadingCieCard"
      }
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    /**
     * Cie reading complete
     */

    actor.send({
      type: "cie-identification-completed",
      url: "http://test.it"
    });

    expect(actor.getSnapshot().value).toStrictEqual({
      Issuance: "RequestingEid"
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    expect(actor.getSnapshot().context).toMatchObject({
      cieAuthContext: {
        callbackUrl: "http://test.it"
      }
    });
    expect(navigateToEidPreviewScreen).toHaveBeenCalledTimes(1);

    /** Last part is the same as the previous test */
  });

  it("Should display NFC instructions (Cie+PIN)", async () => {
    /** Initial part is the same as the previous test, we can start from the identification */

    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(initialSnapshot, {
      value: {
        UserIdentification: {
          CiePin: "InsertingCardPin"
        }
      },
      context: {
        integrityKeyTag: T_INTEGRITY_KEY,
        walletAttestationContext: T_WIA_CONTEXT
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    /**
     * Enter pin with NFC disabled
     */

    actor.send({
      type: "cie-pin-entered",
      pin: "12345678",
      isNfcEnabled: false
    });

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: {
        CiePin: "ActivateNfc"
      }
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      integrityKeyTag: T_INTEGRITY_KEY,
      walletAttestationContext: T_WIA_CONTEXT,
      identification: {
        mode: "ciePin",
        pin: "12345678"
      }
    });
    expect(navigateToNfcInstructionsScreen).toHaveBeenCalledTimes(1);

    /**
     * Enable NFC
     */

    actor.send({
      type: "nfc-enabled"
    });

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: {
        CiePin: "StartingCieAuthFlow"
      }
    });

    /** Last part is the same as the previous test */
  });

  it("Should skip Wallet Instance creation", async () => {
    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(initialSnapshot, {
      context: {
        integrityKeyTag: T_INTEGRITY_KEY
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    /**
     * Start eID issuance
     */

    actor.send({ type: "start" });

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToTosScreen).toHaveBeenCalledTimes(1);

    /**
     * Accept TOS and request WIA
     */

    createWalletInstance.mockImplementation(() =>
      Promise.resolve(T_INTEGRITY_KEY)
    );
    getWalletAttestation.mockImplementation(() =>
      Promise.resolve(T_WIA_CONTEXT)
    );

    actor.send({ type: "accept-tos" });

    expect(actor.getSnapshot().value).toStrictEqual(
      "WalletInstanceAttestationObtainment"
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    expect(createWalletInstance).toHaveBeenCalledTimes(0);
    expect(getWalletAttestation).toHaveBeenCalledTimes(1);
  });

  it("Should skip Wallet Instance Attestation obtainment", () => {
    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(initialSnapshot, {
      context: {
        integrityKeyTag: T_INTEGRITY_KEY,
        walletAttestationContext: T_WIA_CONTEXT
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    /**
     * Start eID issuance
     */

    actor.send({ type: "start" });

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToTosScreen).toHaveBeenCalledTimes(1);

    /**
     * Accept TOS and request WIA
     */

    createWalletInstance.mockImplementation(() =>
      Promise.resolve(T_INTEGRITY_KEY)
    );
    getWalletAttestation.mockImplementation(() =>
      Promise.resolve(T_WIA_CONTEXT)
    );

    actor.send({ type: "accept-tos" });

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: "ModeSelection"
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(createWalletInstance).toHaveBeenCalledTimes(0);
    expect(getWalletAttestation).toHaveBeenCalledTimes(0);
  });

  it("Should allow the user to add a new credential once eID issuance is complete", () => {
    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(initialSnapshot, {
      value: "Success"
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    /**
     * Go to wallet
     */

    actor.send({ type: "add-new-credential" });

    expect(navigateToCredentialCatalog).toHaveBeenCalledTimes(1);
  });

  it("Should return to TOS acceptance if session expires when creating a Wallet Instance", async () => {
    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    /**
     * Start eID issuance
     */

    actor.send({ type: "start" });

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToTosScreen).toHaveBeenCalledTimes(1);

    /**
     * Accept TOS and request WIA
     */

    createWalletInstance.mockImplementation(() => Promise.reject({}));

    isSessionExpired.mockImplementation(() => true);

    actor.send({ type: "accept-tos" });

    expect(actor.getSnapshot().value).toStrictEqual("WalletInstanceCreation");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(createWalletInstance).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getWalletAttestation).toHaveBeenCalledTimes(0));

    // Wallet instance creation failed

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
  });

  it("Should return to TOS acceptance if session expires when obtaining a Wallet Instance Attestation ", async () => {
    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    /**
     * Start eID issuance
     */

    actor.send({ type: "start" });

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToTosScreen).toHaveBeenCalledTimes(1);

    /**
     * Accept TOS and request WIA
     */

    createWalletInstance.mockImplementation(() =>
      Promise.resolve(T_INTEGRITY_KEY)
    );
    getWalletAttestation.mockImplementation(() => Promise.reject({}));

    isSessionExpired.mockImplementation(() => true);

    actor.send({ type: "accept-tos" });

    expect(actor.getSnapshot().value).toStrictEqual("WalletInstanceCreation");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(createWalletInstance).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getWalletAttestation).toHaveBeenCalledTimes(1));

    // Wallet instance creation failed

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
  });

  it("Should fail when creating Wallet Instance", async () => {
    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    /**
     * Start eID issuance
     */

    actor.send({ type: "start" });

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToTosScreen).toHaveBeenCalledTimes(1);

    /**
     * Accept TOS and request WIA
     */

    createWalletInstance.mockImplementation(() => Promise.reject({}));

    isSessionExpired.mockImplementation(() => false);

    actor.send({ type: "accept-tos" });

    expect(actor.getSnapshot().value).toStrictEqual("WalletInstanceCreation");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(createWalletInstance).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getWalletAttestation).toHaveBeenCalledTimes(0));

    // Wallet instance creation failed

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
  });

  it("Should fail when obtaining Wallet Instance Attestation", async () => {
    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    /**
     * Start eID issuance
     */

    actor.send({ type: "start" });

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToTosScreen).toHaveBeenCalledTimes(1);

    /**
     * Accept TOS and request WIA
     */

    createWalletInstance.mockImplementation(() =>
      Promise.resolve(T_INTEGRITY_KEY)
    );
    getWalletAttestation.mockImplementation(() => Promise.reject({}));

    isSessionExpired.mockImplementation(() => false);

    actor.send({ type: "accept-tos" });

    expect(actor.getSnapshot().value).toStrictEqual("WalletInstanceCreation");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(createWalletInstance).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getWalletAttestation).toHaveBeenCalledTimes(1));

    // Wallet instance creation failed

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
  });

  it("Should fail when requesting eID (user identification or eID request failed)", async () => {
    requestEid.mockImplementation(() => Promise.reject({}));

    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(initialSnapshot, {
      value: { UserIdentification: "ModeSelection" }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    // Select identification mode

    actor.send({ type: "select-identification-mode", mode: "cieId" });

    expect(actor.getSnapshot().value).toStrictEqual({
      Issuance: "RequestingEid"
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    expect(navigateToEidPreviewScreen).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(requestEid).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
  });
});
