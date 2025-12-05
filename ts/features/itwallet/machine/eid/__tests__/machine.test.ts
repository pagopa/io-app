/* eslint-disable sonarjs/no-identical-functions */
import { waitFor } from "@testing-library/react-native";
import _ from "lodash";
import {
  assign,
  createActor,
  fromPromise,
  StateFrom,
  waitFor as waitForActor
} from "xstate";
import { idps } from "../../../../../utils/idps";
import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import {
  StoredCredential,
  WalletInstanceAttestations
} from "../../../common/utils/itwTypesUtils";
import { ItwTags } from "../../tags";
import {
  GetWalletAttestationActorParams,
  InitMrtdPoPChallengeActorParams,
  RequestEidActorParams,
  StartAuthFlowActorParams,
  ValidateMrtdPoPChallengeActorParams
} from "../actors";
import {
  AuthenticationContext,
  CieContext,
  Context,
  InitialContext,
  MrtdPoPContext
} from "../context";
import { ItwEidIssuanceMachine, itwEidIssuanceMachine } from "../machine";
import { itwCredentialUpgradeMachine } from "../../upgrade/machine";
import { itwCredentialIssuanceMachine } from "../../credential/machine";
import { CieWarningType } from "../../../identification/cie/utils/types";

type MachineSnapshot = StateFrom<ItwEidIssuanceMachine>;

const T_INTEGRITY_KEY = "abc";
const T_WIA: string = "abcdefg";

/**
 * Actions
 */
const onInit = jest.fn();
const navigateToTosScreen = jest.fn();
const navigateToIpzsPrivacyScreen = jest.fn();
const navigateToIdpSelectionScreen = jest.fn();
const navigateToEidPreviewScreen = jest.fn();
const navigateToSpidLoginScreen = jest.fn();
const navigateToWalletRevocationScreen = jest.fn();
const navigateToSuccessScreen = jest.fn();
const navigateToFailureScreen = jest.fn();
const navigateToWallet = jest.fn();
const navigateToCredentialCatalog = jest.fn();
const navigateToCieNfcPreparationScreen = jest.fn();
const navigateToCieCardPreparationScreen = jest.fn();
const navigateToCiePinPreparationScreen = jest.fn();
const navigateToCieCanPreparationScreen = jest.fn();
const navigateToCiePinScreen = jest.fn();
const navigateToCieAuthenticationScreen = jest.fn();
const navigateToNfcInstructionsScreen = jest.fn();
const navigateToCieIdLoginScreen = jest.fn();
const navigateToCieWarningScreen = jest.fn();
const navigateToIdentificationScreen = jest.fn();
const storeIntegrityKeyTag = jest.fn();
const cleanupIntegrityKeyTag = jest.fn();
const storeWalletInstanceAttestation = jest.fn();
const storeEidCredential = jest.fn();
const closeIssuance = jest.fn();
const handleSessionExpired = jest.fn();
const resetWalletInstance = jest.fn();
const trackWalletInstanceCreation = jest.fn();
const trackWalletInstanceRevocation = jest.fn();
const trackIdentificationMethodSelected = jest.fn();
const storeAuthLevel = jest.fn();
const freezeSimplifiedActivationRequirements = jest.fn();
const clearSimplifiedActivationRequirements = jest.fn();
const loadPidIntoContext = jest.fn();
const navigateToCieCanScreen = jest.fn();
const navigateToCieInternalAuthAndMrtdScreen = jest.fn();

/**
 * Actors
 */
const verifyTrustFederation = jest.fn();
const createWalletInstance = jest.fn();
const getCieStatus = jest.fn();
const getWalletAttestation = jest.fn();
const requestEid = jest.fn();
const startAuthFlow = jest.fn();
const initMrtdPoPChallenge = jest.fn();
const validateMrtdPoPChallenge = jest.fn();

/**
 * Guards
 */
const issuedEidMatchesAuthenticatedUser = jest.fn();
const isSessionExpired = jest.fn();
const isOperationAborted = jest.fn();
const hasValidWalletInstanceAttestation = jest.fn();
const isEligibleForItwSimplifiedActivation = jest.fn();
const revokeWalletInstance = jest.fn();
const hasCredentialType = jest.fn();
const isWalletValid = jest.fn();

describe("itwEidIssuanceMachine", () => {
  const mockedMachine = itwEidIssuanceMachine.provide({
    actions: {
      onInit,
      navigateToTosScreen,
      navigateToIpzsPrivacyScreen,
      navigateToIdpSelectionScreen,
      navigateToEidPreviewScreen,
      navigateToSpidLoginScreen,
      navigateToWalletRevocationScreen,
      navigateToSuccessScreen,
      navigateToFailureScreen,
      navigateToWallet,
      navigateToCredentialCatalog,
      navigateToCieNfcPreparationScreen,
      navigateToCiePinPreparationScreen,
      navigateToCieCardPreparationScreen,
      navigateToCieCanPreparationScreen,
      navigateToCiePinScreen,
      navigateToCieAuthenticationScreen,
      navigateToNfcInstructionsScreen,
      navigateToCieIdLoginScreen,
      navigateToCieWarningScreen,
      navigateToIdentificationScreen,
      navigateToCieCanScreen,
      navigateToCieInternalAuthAndMrtdScreen,
      storeIntegrityKeyTag,
      cleanupIntegrityKeyTag,
      storeWalletInstanceAttestation,
      storeEidCredential,
      closeIssuance,
      handleSessionExpired,
      resetWalletInstance,
      trackWalletInstanceCreation,
      trackWalletInstanceRevocation,
      trackIdentificationMethodSelected,
      storeAuthLevel,
      freezeSimplifiedActivationRequirements,
      clearSimplifiedActivationRequirements,
      loadPidIntoContext: assign(loadPidIntoContext)
    },
    actors: {
      verifyTrustFederation: fromPromise<void>(verifyTrustFederation),
      createWalletInstance: fromPromise<string>(createWalletInstance),
      revokeWalletInstance: fromPromise<void>(revokeWalletInstance),
      getWalletAttestation: fromPromise<
        WalletInstanceAttestations,
        GetWalletAttestationActorParams
      >(getWalletAttestation),
      getCieStatus: fromPromise<CieContext>(getCieStatus),
      requestEid: fromPromise<StoredCredential, RequestEidActorParams>(
        requestEid
      ),
      startAuthFlow: fromPromise<
        AuthenticationContext,
        StartAuthFlowActorParams
      >(startAuthFlow),
      initMrtdPoPChallenge: fromPromise<
        MrtdPoPContext,
        InitMrtdPoPChallengeActorParams
      >(initMrtdPoPChallenge),
      validateMrtdPoPChallenge: fromPromise<
        string,
        ValidateMrtdPoPChallengeActorParams
      >(validateMrtdPoPChallenge),
      credentialUpgradeMachine: itwCredentialUpgradeMachine,
      credentialIssuanceMachine: itwCredentialIssuanceMachine
    },
    guards: {
      issuedEidMatchesAuthenticatedUser,
      isSessionExpired,
      isOperationAborted,
      isEligibleForItwSimplifiedActivation,
      hasValidWalletInstanceAttestation,
      hasCredentialType,
      isWalletValid
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.useFakeTimers();
  });

  it("Should fail if trust federation verification fails", async () => {
    verifyTrustFederation.mockImplementation(() => Promise.reject());

    const actor = createActor(mockedMachine);
    actor.start();

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    /**
     * Start eID issuance
     */

    actor.send({ type: "start", mode: "issuance", level: "l2" });

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToTosScreen).toHaveBeenCalledTimes(1);

    /**
     * Accept TOS and verify trust
     */

    actor.send({ type: "accept-tos" });

    expect(actor.getSnapshot().value).toStrictEqual(
      "TrustFederationVerification"
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(verifyTrustFederation).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
  });

  it("Should obtain an eID (SPID) from L3 Identification with fallback", async () => {
    verifyTrustFederation.mockImplementation(() => Promise.resolve());
    createWalletInstance.mockImplementation(
      () =>
        new Promise(resolve => setTimeout(() => resolve(T_INTEGRITY_KEY), 10))
    );
    getWalletAttestation.mockImplementation(
      () =>
        new Promise(resolve => setTimeout(() => resolve({ jwt: T_WIA }), 10))
    );
    startAuthFlow.mockImplementation(() => Promise.resolve({}));
    requestEid.mockImplementation(() =>
      Promise.resolve(ItwStoredCredentialsMocks.eid)
    );
    issuedEidMatchesAuthenticatedUser.mockImplementation(() => true);

    const actor = createActor(mockedMachine);
    actor.start();

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    /**
     * Start eID issuance
     */

    actor.send({ type: "start", mode: "issuance", level: "l3" });

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToTosScreen).toHaveBeenCalledTimes(1);

    /**
     * Accept TOS and verify trust
     */

    actor.send({ type: "accept-tos" });

    expect(actor.getSnapshot().value).toStrictEqual(
      "TrustFederationVerification"
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(verifyTrustFederation).toHaveBeenCalledTimes(1));

    /**
     * Wallet Instance creation and attestation obtainment
     */

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual("WalletInstanceCreation")
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));

    await waitFor(() => expect(createWalletInstance).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getWalletAttestation).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(storeIntegrityKeyTag).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({ integrityKeyTag: T_INTEGRITY_KEY })
        }),
        undefined
      )
    );
    await waitFor(() =>
      expect(storeWalletInstanceAttestation).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            walletInstanceAttestation: { jwt: T_WIA }
          })
        }),
        undefined
      )
    );
    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      walletInstanceAttestation: { jwt: T_WIA },
      integrityKeyTag: T_INTEGRITY_KEY
    });

    // Wallet instance creation and attestation obtainment success

    // Navigate to ipzs privacy screen
    expect(actor.getSnapshot().value).toStrictEqual("IpzsPrivacyAcceptance");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    // Accept IPZS privacy
    actor.send({ type: "accept-ipzs-privacy" });
    // Navigate to identification mode selection

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual({
        UserIdentification: "Identification"
      })
    );
    expect(navigateToIdentificationScreen).toHaveBeenCalledTimes(1);

    /**
     * Restart the flow as L2 fallback from the beginning (TOS acceptance)
     */

    actor.send({ type: "restart", mode: "issuance", level: "l2-fallback" });

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance")
    );

    actor.send({ type: "accept-tos" });

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual({
        UserIdentification: "Identification"
      })
    );

    /**
     * Choose SPID as identification mode
     */

    actor.send({ type: "select-identification-mode", mode: "spid" });

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: {
        Spid: "IdpSelection"
      }
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToIdpSelectionScreen).toHaveBeenCalledTimes(1);
    expect(trackIdentificationMethodSelected).toHaveBeenCalledTimes(1);

    /**
     * Choose first IDP in list for SPID identification
     */

    actor.send({ type: "select-spid-idp", idp: idps[0] });

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: {
        Spid: "StartingSpidAuthFlow"
      }
    });

    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      mode: "issuance",
      level: "l2-fallback",
      integrityKeyTag: T_INTEGRITY_KEY,
      walletInstanceAttestation: { jwt: T_WIA },
      identification: {
        mode: "spid",
        level: "L2",
        idpId: idps[0].id
      }
    });

    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));

    await waitFor(() => expect(startAuthFlow).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: {
        Spid: "CompletingSpidAuthFlow"
      }
    });

    actor.send({
      type: "user-identification-completed",
      authRedirectUrl: "http://test.it"
    });

    expect(actor.getSnapshot().value).toStrictEqual({
      Issuance: "RequestingEid"
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    expect(actor.getSnapshot().context).toMatchObject({
      authenticationContext: {
        callbackUrl: "http://test.it"
      }
    });
    expect(navigateToEidPreviewScreen).toHaveBeenCalledTimes(1);

    // EID obtained

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual({
        Issuance: "DisplayingPreview"
      })
    );

    actor.send({ type: "add-to-wallet" });

    expect(actor.getSnapshot().value).toStrictEqual("Success");
    expect(storeEidCredential).toHaveBeenCalledTimes(1);
    expect(navigateToSuccessScreen).toHaveBeenCalledTimes(1);

    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      mode: "issuance",
      level: "l2-fallback",
      integrityKeyTag: T_INTEGRITY_KEY,
      walletInstanceAttestation: { jwt: T_WIA },
      identification: {
        mode: "spid",
        level: "L2",
        idpId: idps[0].id
      },
      authenticationContext: expect.objectContaining({
        callbackUrl: "http://test.it"
      }),
      eid: ItwStoredCredentialsMocks.eid
    });

    /**
     * Go to wallet
     */

    actor.send({ type: "go-to-wallet" });

    expect(navigateToWallet).toHaveBeenCalledTimes(1);
  });

  it("Should obtain an eID (CieID) from L2 Identification", async () => {
    /** Initial part is the same as the previous test, we can start from the identification */

    startAuthFlow.mockImplementation(() => Promise.resolve({}));
    requestEid.mockImplementation(() => Promise.resolve({}));

    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: { UserIdentification: "Identification" },
      context: {
        level: "l2",
        mode: "issuance",
        integrityKeyTag: T_INTEGRITY_KEY,
        walletInstanceAttestation: { jwt: T_WIA }
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

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual({
        UserIdentification: {
          CieID: "StartingCieIDAuthFlow"
        }
      })
    );

    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      level: "l2",
      mode: "issuance",
      integrityKeyTag: T_INTEGRITY_KEY,
      walletInstanceAttestation: { jwt: T_WIA },
      identification: {
        mode: "cieId",
        level: "L2"
      },
      authenticationContext: expect.any(Object)
    });
    expect(navigateToCieIdLoginScreen).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(startAuthFlow).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: { CieID: "CompletingCieIDAuthFlow" }
    });

    actor.send({
      type: "user-identification-completed",
      authRedirectUrl: "http://cieid.test.it"
    });

    expect(actor.getSnapshot().value).toStrictEqual({
      Issuance: "RequestingEid"
    });
    expect(actor.getSnapshot().context).toMatchObject({
      authenticationContext: {
        callbackUrl: "http://cieid.test.it"
      }
    });

    expect(navigateToEidPreviewScreen).toHaveBeenCalledTimes(1);
    expect(requestEid).toHaveBeenCalledTimes(1);

    /** Last part is the same as the previous test */
  });

  it("Should obtain an eID (Cie+PIN)", async () => {
    /** Initial part is the same as the previous test, we can start from the identification */

    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: { UserIdentification: "Identification" },
      context: {
        integrityKeyTag: T_INTEGRITY_KEY,
        walletInstanceAttestation: { jwt: T_WIA },
        cieContext: {
          isNFCEnabled: true,
          isCIEAuthenticationSupported: true
        }
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
        CiePin: "PreparationPin"
      }
    });

    actor.send({ type: "next" });

    actor.send({ type: "next" });

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: {
        CiePin: "InsertingCardPin"
      }
    });

    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      integrityKeyTag: T_INTEGRITY_KEY,
      walletInstanceAttestation: { jwt: T_WIA },
      identification: undefined,
      cieContext: {
        isNFCEnabled: true,
        isCIEAuthenticationSupported: true
      }
    });
    expect(navigateToCiePinScreen).toHaveBeenCalledTimes(1);

    /**
     * Enter pin
     */

    startAuthFlow.mockImplementation(() => Promise.resolve({}));

    actor.send({
      type: "cie-pin-entered",
      pin: "12345678"
    });

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: {
        CiePin: "PreparationCie"
      }
    });
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      integrityKeyTag: T_INTEGRITY_KEY,
      walletInstanceAttestation: { jwt: T_WIA },
      identification: {
        mode: "ciePin",
        level: "L3",
        pin: "12345678"
      },
      cieContext: {
        isNFCEnabled: true,
        isCIEAuthenticationSupported: true
      }
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    // Need to trigger "next" to move from PreparationCie to StartingCieAuthFlow
    actor.send({ type: "next" });

    await waitFor(() => expect(startAuthFlow).toHaveBeenCalledTimes(1));

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
      type: "user-identification-completed",
      authRedirectUrl: "http://test.it"
    });

    expect(actor.getSnapshot().value).toStrictEqual({
      Issuance: "RequestingEid"
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    expect(actor.getSnapshot().context).toMatchObject({
      authenticationContext: {
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

    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: {
        UserIdentification: {
          CiePin: "PreparationPin"
        }
      },
      context: {
        integrityKeyTag: T_INTEGRITY_KEY,
        walletInstanceAttestation: { jwt: T_WIA },
        cieContext: {
          isNFCEnabled: false,
          isCIEAuthenticationSupported: true
        }
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
      type: "next"
    });

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: {
        CiePin: "RequestingNfcActivation"
      }
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      integrityKeyTag: T_INTEGRITY_KEY,
      walletInstanceAttestation: { jwt: T_WIA },
      identification: undefined,
      cieContext: {
        isNFCEnabled: false,
        isCIEAuthenticationSupported: true
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
        CiePin: "InsertingCardPin"
      }
    });
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      integrityKeyTag: T_INTEGRITY_KEY,
      walletInstanceAttestation: { jwt: T_WIA },
      identification: undefined,
      cieContext: {
        isNFCEnabled: true,
        isCIEAuthenticationSupported: true
      }
    });

    /** Last part is the same as the previous test */
  });

  it("Should skip Wallet Instance creation", async () => {
    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
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

    actor.send({ type: "start", mode: "issuance", level: "l2" });

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToTosScreen).toHaveBeenCalledTimes(1);

    /**
     * Accept TOS and request WIA
     */

    verifyTrustFederation.mockImplementation(() => Promise.resolve());

    createWalletInstance.mockImplementation(
      () =>
        new Promise(resolve => setTimeout(() => resolve(T_INTEGRITY_KEY), 10))
    );
    getWalletAttestation.mockImplementation(
      () =>
        new Promise(resolve => setTimeout(() => resolve({ jwt: T_WIA }), 10))
    );

    actor.send({ type: "accept-tos" });

    expect(actor.getSnapshot().value).toStrictEqual(
      "TrustFederationVerification"
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(verifyTrustFederation).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual(
        "WalletInstanceAttestationObtainment"
      )
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    expect(createWalletInstance).toHaveBeenCalledTimes(0);
    expect(getWalletAttestation).toHaveBeenCalledTimes(1);
  });

  it("Should skip Wallet Instance Attestation obtainment", async () => {
    hasValidWalletInstanceAttestation.mockImplementation(() => true);

    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      context: {
        integrityKeyTag: T_INTEGRITY_KEY,
        walletInstanceAttestation: { jwt: T_WIA }
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    /**
     * Start eID issuance
     */

    actor.send({ type: "start", mode: "issuance", level: "l2" });

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToTosScreen).toHaveBeenCalledTimes(1);

    /**
     * Accept TOS and request WIA
     */

    actor.send({ type: "accept-tos" });

    expect(actor.getSnapshot().value).toStrictEqual(
      "TrustFederationVerification"
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    verifyTrustFederation.mockImplementation(() => Promise.resolve());
    await waitFor(() => expect(verifyTrustFederation).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("IpzsPrivacyAcceptance");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([]));
    expect(createWalletInstance).toHaveBeenCalledTimes(0);
    expect(getWalletAttestation).toHaveBeenCalledTimes(0);

    // Accept IPZS privacy
    actor.send({ type: "accept-ipzs-privacy" });

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: "Identification"
    });
  });

  it("Should allow the user to add a new credential once eID issuance is complete", () => {
    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
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

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    /**
     * Start eID issuance
     */

    actor.send({ type: "start", mode: "issuance", level: "l2" });

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
    expect(actor.getSnapshot().context).toStrictEqual({
      ...InitialContext,
      mode: "issuance",
      level: "l2"
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToTosScreen).toHaveBeenCalledTimes(1);

    /**
     * Accept TOS and request WIA
     */

    verifyTrustFederation.mockImplementation(() => Promise.resolve());

    createWalletInstance.mockImplementation(
      () => new Promise((__, reject) => setTimeout(() => reject({}), 10))
    );

    isSessionExpired.mockImplementation(() => true);

    actor.send({ type: "accept-tos" });

    expect(actor.getSnapshot().value).toStrictEqual(
      "TrustFederationVerification"
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(verifyTrustFederation).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual("WalletInstanceCreation")
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));

    await waitFor(() => expect(handleSessionExpired).toHaveBeenCalled());
    await waitFor(() => expect(createWalletInstance).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getWalletAttestation).toHaveBeenCalledTimes(0));

    // Wallet instance creation failed

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance")
    );
  });

  it("Should return to TOS acceptance if session expires when obtaining a Wallet Instance Attestation ", async () => {
    const actor = createActor(mockedMachine);
    actor.start();

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    /**
     * Start eID issuance
     */

    actor.send({ type: "start", mode: "issuance", level: "l2" });

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToTosScreen).toHaveBeenCalledTimes(1);

    /**
     * Accept TOS and request WIA
     */

    verifyTrustFederation.mockImplementation(() => Promise.resolve());

    createWalletInstance.mockImplementation(
      () =>
        new Promise(resolve => setTimeout(() => resolve(T_INTEGRITY_KEY), 10))
    );
    getWalletAttestation.mockImplementation(
      () => new Promise((__, reject) => setTimeout(() => reject({}), 10))
    );
    isSessionExpired.mockImplementation(() => true);

    actor.send({ type: "accept-tos" });

    expect(actor.getSnapshot().value).toStrictEqual(
      "TrustFederationVerification"
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(verifyTrustFederation).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual("WalletInstanceCreation")
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(createWalletInstance).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getWalletAttestation).toHaveBeenCalledTimes(1));

    // Wallet instance creation failed

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
  });

  it("Should fail when creating Wallet Instance", async () => {
    const actor = createActor(mockedMachine);
    actor.start();

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    /**
     * Start eID issuance
     */

    actor.send({ type: "start", mode: "issuance", level: "l2" });

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToTosScreen).toHaveBeenCalledTimes(1);

    /**
     * Accept TOS and request WIA
     */
    verifyTrustFederation.mockImplementation(() => Promise.resolve());

    createWalletInstance.mockImplementation(
      () => new Promise((__, reject) => setTimeout(() => reject({}), 10))
    );
    isSessionExpired.mockImplementation(() => false);

    actor.send({ type: "accept-tos" });

    expect(actor.getSnapshot().value).toStrictEqual(
      "TrustFederationVerification"
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(verifyTrustFederation).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual("WalletInstanceCreation")
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(createWalletInstance).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getWalletAttestation).toHaveBeenCalledTimes(0));

    // Wallet instance creation failed

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual("Failure")
    );
  });

  it("Should fail when obtaining Wallet Instance Attestation", async () => {
    const actor = createActor(mockedMachine);
    actor.start();

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    /**
     * Start eID issuance
     */

    actor.send({ type: "start", mode: "issuance", level: "l2" });

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToTosScreen).toHaveBeenCalledTimes(1);

    /**
     * Accept TOS and request WIA
     */
    verifyTrustFederation.mockImplementation(() => Promise.resolve());
    createWalletInstance.mockImplementation(
      () =>
        new Promise(resolve => setTimeout(() => resolve(T_INTEGRITY_KEY), 10))
    );

    getWalletAttestation.mockImplementation(
      () => new Promise((__, reject) => setTimeout(() => reject({}), 10))
    );

    isSessionExpired.mockImplementation(() => false);

    actor.send({ type: "accept-tos" });

    expect(actor.getSnapshot().value).toStrictEqual(
      "TrustFederationVerification"
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(verifyTrustFederation).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual("WalletInstanceCreation")
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(createWalletInstance).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getWalletAttestation).toHaveBeenCalledTimes(1));

    // Wallet instance creation failed

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual("Failure")
    );
  });

  it("Should fail when requesting eID (user identification or eID request failed)", async () => {
    startAuthFlow.mockImplementation(() => Promise.resolve({}));
    requestEid.mockImplementation(() => Promise.reject({}));

    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: { UserIdentification: "Identification" }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    // Select identification mode
    actor.send({ type: "select-identification-mode", mode: "cieId" });

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual({
        UserIdentification: {
          CieID: "StartingCieIDAuthFlow"
        }
      })
    );
    expect(navigateToCieIdLoginScreen).toHaveBeenCalledTimes(1);

    // Start the issuance flow

    await waitFor(() => expect(startAuthFlow).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: { CieID: "CompletingCieIDAuthFlow" }
    });

    actor.send({
      type: "user-identification-completed",
      authRedirectUrl: "http://cieid.test.it"
    });

    expect(actor.getSnapshot().value).toStrictEqual({
      Issuance: "RequestingEid"
    });

    await waitFor(() => expect(requestEid).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
  });

  it("Should handle 401 when creating wallet instance", async () => {
    const actor = createActor(mockedMachine);
    actor.start();

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    /**
     * Start eID issuance
     */

    actor.send({ type: "start", mode: "issuance", level: "l2" });

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToTosScreen).toHaveBeenCalledTimes(1);

    /**
     * Accept TOS and request WIA
     */

    verifyTrustFederation.mockImplementation(() => Promise.resolve());

    createWalletInstance.mockImplementation(
      () => new Promise((__, reject) => setTimeout(() => reject({}), 10))
    );
    isSessionExpired.mockImplementation(() => true);

    actor.send({ type: "accept-tos" });

    expect(actor.getSnapshot().value).toStrictEqual(
      "TrustFederationVerification"
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(verifyTrustFederation).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual("WalletInstanceCreation")
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(createWalletInstance).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getWalletAttestation).toHaveBeenCalledTimes(0));
    await waitFor(() => expect(handleSessionExpired).toHaveBeenCalledTimes(1));

    // Wallet instance creation failed

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
  });

  it("Should handle 401 when revoking wallet instance", async () => {
    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: "Failure"
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    // Revoke Wallet Instance

    revokeWalletInstance.mockImplementation(() => Promise.reject({}));
    isSessionExpired.mockImplementation(() => true);

    actor.send({ type: "revoke-wallet-instance" });

    expect(actor.getSnapshot().value).toStrictEqual("WalletInstanceRevocation");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(revokeWalletInstance).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(handleSessionExpired).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
  });

  it("Should obtain an eID (SPID), reissuing mode with no credentials reissuing", async () => {
    // The wallet instance and attestation already exist
    const initialContext = {
      ...InitialContext,
      integrityKeyTag: T_INTEGRITY_KEY,
      walletInstanceAttestation: { jwt: T_WIA }
    };

    const baseSnapshot = createActor(itwEidIssuanceMachine).getSnapshot();

    const snapshot: MachineSnapshot = {
      ...baseSnapshot,
      context: initialContext
    };

    const actor = createActor(mockedMachine, {
      snapshot
    });

    actor.start();

    hasValidWalletInstanceAttestation.mockImplementation(() => true);
    verifyTrustFederation.mockImplementation(() => Promise.resolve());

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(initialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    actor.send({ type: "start", mode: "reissuance", level: "l2" });

    expect(actor.getSnapshot().value).toStrictEqual(
      "TrustFederationVerification"
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));

    const intermediateState1 = await waitForActor(actor, snapshot1 =>
      snapshot1.matches({
        UserIdentification: "Identification"
      })
    );
    expect(intermediateState1.value).toStrictEqual({
      UserIdentification: "Identification"
    });

    expect(verifyTrustFederation).toHaveBeenCalledTimes(1);

    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...initialContext,
      mode: "reissuance",
      level: "l2"
    });

    expect(navigateToIdentificationScreen).toHaveBeenCalledTimes(1);

    /**
     * Choose SPID as identification mode
     */

    actor.send({ type: "select-identification-mode", mode: "spid" });

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: {
        Spid: "IdpSelection"
      }
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToIdpSelectionScreen).toHaveBeenCalledTimes(1);

    /**
     * Choose first IDP in list for SPID identification
     */

    startAuthFlow.mockImplementation(() => Promise.resolve({}));

    requestEid.mockImplementation(() =>
      Promise.resolve(ItwStoredCredentialsMocks.eid)
    );

    issuedEidMatchesAuthenticatedUser.mockImplementation(() => true);

    actor.send({ type: "select-spid-idp", idp: idps[0] });

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: {
        Spid: "StartingSpidAuthFlow"
      }
    });

    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...initialContext,
      mode: "reissuance",
      level: "l2",
      integrityKeyTag: T_INTEGRITY_KEY,
      walletInstanceAttestation: { jwt: T_WIA },
      identification: {
        mode: "spid",
        level: "L2",
        idpId: idps[0].id
      }
    });

    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));

    await waitFor(() => expect(startAuthFlow).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: {
        Spid: "CompletingSpidAuthFlow"
      }
    });

    actor.send({
      type: "user-identification-completed",
      authRedirectUrl: "http://test.it"
    });

    expect(actor.getSnapshot().value).toStrictEqual({
      Issuance: "RequestingEid"
    });

    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    expect(actor.getSnapshot().context).toMatchObject({
      authenticationContext: {
        callbackUrl: "http://test.it"
      }
    });
    expect(navigateToEidPreviewScreen).toHaveBeenCalledTimes(1);

    // EID obtained

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual({
        Issuance: "DisplayingPreview"
      })
    );

    actor.send({ type: "add-to-wallet" });

    expect(storeEidCredential).toHaveBeenCalledTimes(1);

    actor.send({ type: "go-to-wallet" });

    expect(navigateToWallet).toHaveBeenCalledTimes(1);

    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...initialContext,
      mode: "reissuance",
      level: "l2",
      integrityKeyTag: T_INTEGRITY_KEY,
      walletInstanceAttestation: { jwt: T_WIA },
      identification: {
        mode: "spid",
        level: "L2",
        idpId: idps[0].id
      },
      authenticationContext: expect.objectContaining({
        callbackUrl: "http://test.it"
      }),
      eid: ItwStoredCredentialsMocks.eid
    });
  });

  it("Should go back to Idle state if mode is 'reissuing'", async () => {
    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: { UserIdentification: "Identification" },
      context: {
        mode: "reissuance"
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    actor.send({ type: "back" });

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
  });

  it("Should go back to IpzsPrivacyAcceptance state if mode is 'issuing'", async () => {
    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: { UserIdentification: "Identification" }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    actor.send({ type: "back" });

    expect(actor.getSnapshot().value).toStrictEqual("IpzsPrivacyAcceptance");
  });

  it("should cleanup integrity key tag and fail when obtaining Wallet Instance Attestation fails", async () => {
    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    /**
     * Start eID issuance
     */
    actor.send({ type: "start", mode: "issuance", level: "l2" });

    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToTosScreen).toHaveBeenCalledTimes(1);

    /**
     * Accept TOS and request WIA
     */

    verifyTrustFederation.mockImplementation(() => Promise.resolve());
    createWalletInstance.mockImplementation(
      () =>
        new Promise(resolve => setTimeout(() => resolve(T_INTEGRITY_KEY), 10))
    );
    getWalletAttestation.mockImplementation(
      () => new Promise((__, reject) => setTimeout(() => reject({}), 10))
    );
    isSessionExpired.mockImplementation(() => false); // Session not expired
    isWalletValid.mockImplementation(() => false);

    actor.send({ type: "accept-tos" });

    expect(actor.getSnapshot().value).toStrictEqual(
      "TrustFederationVerification"
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(verifyTrustFederation).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual("WalletInstanceCreation")
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));

    await waitFor(() => expect(createWalletInstance).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getWalletAttestation).toHaveBeenCalledTimes(1));

    // Wallet Instance Attestation failure triggers cleanupIntegrityKeyTag
    expect(cleanupIntegrityKeyTag).toHaveBeenCalledTimes(1);

    // Check that the machine transitions to Failure state
    expect(actor.getSnapshot().value).toStrictEqual("Failure");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
  });

  it("should NOT cleanup integrity key tag when wallet is valid and attestation fails", async () => {
    const initialContext = {
      ...InitialContext,
      integrityKeyTag: T_INTEGRITY_KEY,
      walletInstanceAttestation: { jwt: T_WIA },
      eid: ItwStoredCredentialsMocks.eid,
      legacyCredentials: [
        ItwStoredCredentialsMocks.mdl
      ] as ReadonlyArray<StoredCredential>
    };

    const baseSnapshot = createActor(itwEidIssuanceMachine).getSnapshot();

    const snapshot: MachineSnapshot = {
      ...baseSnapshot,
      context: initialContext
    };

    const actor = createActor(mockedMachine, {
      snapshot
    });

    actor.start();

    hasValidWalletInstanceAttestation.mockImplementation(() => false);
    verifyTrustFederation.mockImplementation(() => Promise.resolve());
    getWalletAttestation.mockImplementation(
      () => new Promise((__, reject) => setTimeout(() => reject({}), 10))
    );
    isSessionExpired.mockImplementation(() => false); // Session not expired
    isWalletValid.mockImplementation(() => true);

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(initialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    actor.send({ type: "start", mode: "reissuance", level: "l2" });

    expect(actor.getSnapshot().value).toStrictEqual(
      "TrustFederationVerification"
    );

    await waitFor(() => expect(verifyTrustFederation).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getWalletAttestation).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual("Failure")
    );

    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(cleanupIntegrityKeyTag).not.toHaveBeenCalled();
  });

  it("Should go to Wallet Instance Creation and then IpzsPrivacyAcceptance if there is no integrity key tag but a valid WIA exists", async () => {
    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: "TosAcceptance",
      context: {
        integrityKeyTag: undefined,
        walletInstanceAttestation: { jwt: T_WIA }
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });

    verifyTrustFederation.mockImplementation(() => Promise.resolve());
    createWalletInstance.mockImplementation(
      () =>
        new Promise(resolve => setTimeout(() => resolve(T_INTEGRITY_KEY), 10))
    );
    getWalletAttestation.mockImplementation(
      () =>
        new Promise(resolve => setTimeout(() => resolve({ jwt: T_WIA }), 10))
    );

    hasValidWalletInstanceAttestation.mockImplementation(() => true);

    actor.start();
    actor.send({ type: "accept-tos" });

    expect(actor.getSnapshot().value).toStrictEqual(
      "TrustFederationVerification"
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => {
      expect(verifyTrustFederation).toHaveBeenCalledTimes(1);
    });
    await waitFor(() =>
      expect(actor.getSnapshot().value).not.toStrictEqual(
        "TrustFederationVerification"
      )
    );

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual("WalletInstanceCreation")
    );

    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));

    await waitFor(() => expect(createWalletInstance).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getWalletAttestation).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      walletInstanceAttestation: { jwt: T_WIA },
      integrityKeyTag: T_INTEGRITY_KEY
    });

    // Wallet instance creation and attestation obtainment success

    // Navigate to ipzs privacy screen
    expect(actor.getSnapshot().value).toStrictEqual("IpzsPrivacyAcceptance");
  });

  it("Should navigate to CieWarning screen when 'go-to-cie-warning' event is received", async () => {
    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();

    const snapshotInModeSelection: MachineSnapshot = _.merge(
      undefined,
      initialSnapshot,
      {
        value: { UserIdentification: "Identification" },
        context: {
          ...InitialContext,
          integrityKeyTag: T_INTEGRITY_KEY,
          walletInstanceAttestation: { jwt: T_WIA }
        }
      } as MachineSnapshot
    );

    const actor = createActor(mockedMachine, {
      snapshot: snapshotInModeSelection
    });

    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: "Identification"
    });

    const testWarningType: CieWarningType = "card";

    actor.send({ type: "go-to-cie-warning", warning: testWarningType });

    await waitFor(() => {
      expect(actor.getSnapshot().value).toStrictEqual({
        UserIdentification: {
          CiePin: {
            CieWarning: "Identification"
          }
        }
      });
    });

    expect(navigateToCieWarningScreen).toHaveBeenCalledTimes(1);
  });

  it("Should navigate to InsertingCardPin through the preparation screens if L3 is enabled", async () => {
    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();
    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: { UserIdentification: "Identification" },
      context: {
        integrityKeyTag: T_INTEGRITY_KEY,
        walletInstanceAttestation: { jwt: T_WIA },
        level: "l3",
        cieContext: {
          isNFCEnabled: true,
          isCIEAuthenticationSupported: true
        }
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, { snapshot });
    actor.start();

    actor.send({ type: "select-identification-mode", mode: "ciePin" });

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: {
        CiePin: "PreparationPin"
      }
    });

    expect(navigateToCiePinPreparationScreen).toHaveBeenCalledTimes(1);

    actor.send({ type: "next" });

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: {
        CiePin: "InsertingCardPin"
      }
    });

    expect(navigateToCiePinScreen).toHaveBeenCalledTimes(1);

    actor.send({ type: "next" });

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: {
        CiePin: "InsertingCardPin"
      }
    });

    expect(navigateToCiePinScreen).toHaveBeenCalledTimes(1);
  });

  it("Should return to PreparationPin when navigating back from CieWarning", async () => {
    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();
    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: { UserIdentification: "Identification" },
      context: {
        integrityKeyTag: T_INTEGRITY_KEY,
        walletInstanceAttestation: { jwt: T_WIA },
        level: "l3",
        cieContext: {
          isNFCEnabled: true,
          isCIEAuthenticationSupported: true
        }
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, { snapshot });
    actor.start();

    actor.send({ type: "select-identification-mode", mode: "ciePin" });

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: {
        CiePin: "PreparationPin"
      }
    });

    expect(navigateToCiePinPreparationScreen).toHaveBeenCalledTimes(1);

    const testWarningType: CieWarningType = "card";

    actor.send({ type: "go-to-cie-warning", warning: testWarningType });

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: {
        CiePin: {
          CieWarning: "PreparationPin"
        }
      }
    });

    expect(navigateToCieWarningScreen).toHaveBeenCalledTimes(1);

    actor.send({ type: "back" });

    expect(navigateToCiePinPreparationScreen).toHaveBeenCalledTimes(2);

    expect(actor.getSnapshot().value).toStrictEqual({
      UserIdentification: {
        CiePin: "PreparationPin"
      }
    });
  });

  it("Should initialize the machine context with L3 active", async () => {
    const actor = createActor(mockedMachine);
    actor.start();

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    /**
     * Start
     */

    actor.send({ type: "start", mode: "issuance", level: "l3" });

    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      level: "l3"
    });
    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
    expect(navigateToTosScreen).toHaveBeenCalledTimes(1);
  });

  it("Should handle credentials upgrade", (onDone: jest.DoneCallback) => {
    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();
    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: { Issuance: "DisplayingPreview" },
      context: {
        mode: "upgrade",
        eid: ItwStoredCredentialsMocks.eid,
        integrityKeyTag: T_INTEGRITY_KEY,
        walletInstanceAttestation: { jwt: T_WIA },
        level: "l3",
        legacyCredentials: [
          ItwStoredCredentialsMocks.mdl
        ] as ReadonlyArray<StoredCredential>
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, { snapshot });
    actor.start();

    actor.subscribe(snap => {
      if (snap.matches("CredentialsUpgrade")) {
        onDone();
      }
    });

    actor.send({ type: "add-to-wallet" });
  });

  it("Should skip credentials upgrade if no credentials are present", async () => {
    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();
    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: { Issuance: "DisplayingPreview" },
      context: {
        mode: "upgrade",
        integrityKeyTag: T_INTEGRITY_KEY,
        walletInstanceAttestation: { jwt: T_WIA },
        level: "l3",
        legacyCredentials: [] as ReadonlyArray<StoredCredential>
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, { snapshot });
    actor.start();

    actor.send({ type: "add-to-wallet" });

    expect(actor.getSnapshot().value).toStrictEqual("Success");
  });

  it("should call navigateToIpzsPrivacyScreen once after 5000ms in TrustFederationVerification state", async () => {
    const actor = createActor(mockedMachine);
    verifyTrustFederation.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({}), 6000))
    );
    hasValidWalletInstanceAttestation.mockImplementation(() => true);

    actor.start();
    actor.send({ type: "start", mode: "issuance", level: "l2" });
    actor.send({ type: "accept-tos" });

    expect(actor.getSnapshot().value).toStrictEqual(
      "TrustFederationVerification"
    );

    jest.advanceTimersByTime(6000);

    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    expect(navigateToIpzsPrivacyScreen).toHaveBeenCalledTimes(1);
  });

  it("should call navigateToL2IdentificationScreen once after 5000ms in TrustFederationVerification state", async () => {
    const actor = createActor(mockedMachine);
    verifyTrustFederation.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({}), 6000))
    );

    actor.start();
    actor.send({ type: "start", mode: "reissuance", level: "l2" });

    expect(actor.getSnapshot().value).toStrictEqual(
      "TrustFederationVerification"
    );

    jest.advanceTimersByTime(6000);

    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    expect(navigateToIdentificationScreen).toHaveBeenCalledTimes(1);
  });

  it("Should start the simplified activation flow without credentials", async () => {
    hasValidWalletInstanceAttestation.mockImplementation(() => true);
    isEligibleForItwSimplifiedActivation.mockImplementation(() => true);

    const actor = createActor(mockedMachine);
    actor.start();

    // Start
    actor.send({ type: "start", level: "l3", mode: "upgrade" });
    expect(actor.getSnapshot().value).toStrictEqual("TosAcceptance");

    // Accept Wallet Provider TOS
    actor.send({ type: "accept-tos" });
    expect(actor.getSnapshot().value).toStrictEqual(
      "TrustFederationVerification"
    );
    await waitFor(() => {
      expect(verifyTrustFederation).toHaveBeenCalledTimes(1);
    });
    expect(actor.getSnapshot().value).toStrictEqual("IpzsPrivacyAcceptance");

    // Accept Credential Issuer privacy policy
    actor.send({ type: "accept-ipzs-privacy" });
    expect(actor.getSnapshot().value).toStrictEqual("Success");
    expect(clearSimplifiedActivationRequirements).toHaveBeenCalledTimes(1);
  });

  it("Should start the simplified activation flow with credentials upgrade only", onDone => {
    isEligibleForItwSimplifiedActivation.mockImplementation(() => true);
    loadPidIntoContext.mockReturnValue({ eid: {} });

    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();
    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: "IpzsPrivacyAcceptance",
      context: {
        mode: "upgrade",
        integrityKeyTag: T_INTEGRITY_KEY,
        walletInstanceAttestation: { jwt: T_WIA },
        level: "l3",
        legacyCredentials: [
          ItwStoredCredentialsMocks.mdl
        ] as ReadonlyArray<StoredCredential>
      }
    });
    const actor = createActor(mockedMachine, { snapshot });

    actor.start();

    actor.subscribe(snap => {
      if (snap.matches("CredentialsUpgrade")) {
        onDone();
      }
    });

    actor.send({ type: "accept-ipzs-privacy" });
    expect(clearSimplifiedActivationRequirements).toHaveBeenCalledTimes(1);
    expect(loadPidIntoContext).toHaveBeenCalledTimes(1);
  });

  it("Should initialize the credential issuance machine when credentialType is present", async () => {
    hasCredentialType.mockImplementation(() => true);
    const initialSnapshot: MachineSnapshot = createActor(
      itwEidIssuanceMachine
    ).getSnapshot();
    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: { Issuance: "DisplayingPreview" },
      context: {
        mode: "credentialTriggered",
        eid: ItwStoredCredentialsMocks.eid,
        integrityKeyTag: T_INTEGRITY_KEY,
        walletInstanceAttestation: { jwt: T_WIA },
        level: "l3",
        credentialType: "mDL"
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, { snapshot });
    actor.start();

    actor.send({ type: "add-to-wallet" });

    await waitFor(() => {
      expect(actor.getSnapshot().matches("CredentialIssuance")).toBe(true);
    });

    expect(navigateToSuccessScreen).toHaveBeenCalledTimes(1);

    const child = actor.getSnapshot().children.credentialIssuanceMachine;
    expect(child).toBeDefined();

    it("Should start the MRTD PoP flow", async () => {
      /** Initial part - setup with L3 and existing WIA */
      const initialSnapshot: MachineSnapshot = createActor(
        itwEidIssuanceMachine
      ).getSnapshot();

      const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
        value: { UserIdentification: "Identification" },
        context: {
          level: "l3",
          mode: "issuance",
          integrityKeyTag: T_INTEGRITY_KEY,
          walletInstanceAttestation: { jwt: T_WIA }
        }
      } as MachineSnapshot);

      const actor = createActor(mockedMachine, {
        snapshot
      });
      actor.start();

      /**
       * Choose SPID as identification mode (L3 requires MRTD PoP for SPID/CieID)
       */
      actor.send({ type: "select-identification-mode", mode: "spid" });

      expect(actor.getSnapshot().value).toStrictEqual({
        UserIdentification: {
          Spid: "IdpSelection"
        }
      });

      /**
       * Choose first IDP in list for SPID identification
       */
      startAuthFlow.mockImplementation(() => Promise.resolve({}));

      actor.send({ type: "select-spid-idp", idp: idps[0] });

      await waitFor(() => expect(startAuthFlow).toHaveBeenCalledTimes(1));

      expect(actor.getSnapshot().value).toStrictEqual({
        UserIdentification: {
          Spid: "CompletingSpidAuthFlow"
        }
      });

      /**
       * Complete user identification - this should trigger MRTD PoP flow
       */
      const mockMrtdContext: MrtdPoPContext = {
        challenge: "mock-challenge",
        mrtd_auth_session: "mock-session",
        mrtd_pop_nonce: "mock-nonce",
        validationUrl: "http://validation.test.it"
      };

      initMrtdPoPChallenge.mockImplementation(() =>
        Promise.resolve(mockMrtdContext)
      );

      actor.send({
        type: "user-identification-completed",
        authRedirectUrl: "http://spid.test.it"
      });

      expect(actor.getSnapshot().context).toMatchObject({
        authenticationContext: {
          callbackUrl: "http://spid.test.it"
        }
      });

      /**
       * Should enter MRTD PoP flow instead of going directly to issuance
       */
      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          MrtdPoP: "InitializingChallenge"
        })
      );

      await waitFor(() =>
        expect(initMrtdPoPChallenge).toHaveBeenCalledTimes(1)
      );

      /**
       * Challenge initialized, should display CAN preparation instructions
       */
      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          MrtdPoP: "DisplayingCanPreparationInstructions"
        })
      );

      expect(navigateToCieCanPreparationScreen).toHaveBeenCalledTimes(1);
      expect(actor.getSnapshot().context.mrtdContext).toStrictEqual(
        mockMrtdContext
      );

      /**
       * User proceeds to CAN input
       */
      actor.send({ type: "next" });

      expect(actor.getSnapshot().value).toStrictEqual({
        MrtdPoP: "WaitingForCan"
      });
      expect(navigateToCieCanScreen).toHaveBeenCalledTimes(1);

      /**
       * User enters CAN
       */
      const testCan = "123456";
      actor.send({ type: "cie-can-entered", can: testCan });

      expect(actor.getSnapshot().value).toStrictEqual({
        MrtdPoP: "DisplayingCieNfcPreparationInstructions"
      });
      expect(actor.getSnapshot().context.mrtdContext).toMatchObject({
        ...mockMrtdContext,
        can: testCan
      });
      expect(navigateToCieNfcPreparationScreen).toHaveBeenCalledTimes(1);

      /**
       * User proceeds to sign the challenge
       */
      actor.send({ type: "next" });

      expect(actor.getSnapshot().value).toStrictEqual({
        MrtdPoP: "SigningChallenge"
      });
      expect(navigateToCieInternalAuthAndMrtdScreen).toHaveBeenCalledTimes(1);

      /**
       * MRTD challenge signed successfully
       */
      const mockSignedData = {
        nis_data: {
          nis: "nis-data",
          signedChallenge: "signed-challenge-data",
          publicKey: "public-key-data",
          sod: "sod-ias-data"
        },
        mrtd_data: {
          dg1: "dg1-data",
          dg11: "dg11-data",
          sod: "sod-mrtd-data"
        }
      };

      validateMrtdPoPChallenge.mockImplementation(() =>
        Promise.resolve("http://callback.test.it")
      );

      actor.send({
        type: "mrtd-challenged-signed",
        data: mockSignedData
      });

      expect(actor.getSnapshot().value).toStrictEqual({
        MrtdPoP: "ChallengeValidation"
      });

      expect(actor.getSnapshot().context.mrtdContext).toMatchObject({
        ...mockMrtdContext,
        can: testCan,
        ias: {
          challenge_signed: mockSignedData.nis_data.signedChallenge,
          ias_pk: mockSignedData.nis_data.publicKey,
          sod_ias: mockSignedData.nis_data.sod
        },
        mrtd: {
          dg1: mockSignedData.mrtd_data.dg1,
          dg11: mockSignedData.mrtd_data.dg11,
          sod_mrtd: mockSignedData.mrtd_data.sod
        }
      });

      /**
       * Challenge validation in progress
       */
      await waitFor(() =>
        expect(validateMrtdPoPChallenge).toHaveBeenCalledTimes(1)
      );

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          MrtdPoP: "Authorization"
        })
      );

      expect(actor.getSnapshot().context.mrtdContext?.callbackUrl).toBe(
        "http://callback.test.it"
      );

      /**
       * Complete MRTD PoP verification
       */
      actor.send({
        type: "mrtd-pop-verification-completed",
        authRedirectUrl: "http://final-auth.test.it"
      });

      expect(storeAuthLevel).toHaveBeenCalled();

      /**
       * Should transition to Issuance state
       */
      requestEid.mockImplementation(() =>
        Promise.resolve(ItwStoredCredentialsMocks.eid)
      );
      issuedEidMatchesAuthenticatedUser.mockImplementation(() => true);

      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Issuance: "RequestingEid"
        })
      );

      expect(navigateToEidPreviewScreen).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(requestEid).toHaveBeenCalledTimes(1));

      // EID obtained
      await waitFor(() =>
        expect(actor.getSnapshot().value).toStrictEqual({
          Issuance: "DisplayingPreview"
        })
      );
    });
  });
});
