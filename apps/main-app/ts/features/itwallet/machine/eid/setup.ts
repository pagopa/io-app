import { assertEvent, assign, fromCallback, fromPromise, setup } from "xstate";

import { assert } from "../../../../utils/assert.ts";
import {
  CredentialAccessToken,
  WalletInstanceAttestations
} from "../../common/utils/itwTypesUtils";
import { isMrtdPoPChallengeRequired } from "../../common/utils/mrtdUrl";
import { itwCredentialUpgradeMachine } from "../upgrade/machine.ts";
import {
  CreateWalletInstanceActorParams,
  GetWalletAttestationActorParams,
  InitMrtdPoPChallengeActorParams,
  ObtainStatusListActorInput,
  ObtainStatusListActorOutput,
  RequestAccessTokenActorParams,
  RequestEidActorOutput,
  type RequestEidActorParams,
  StartAuthFlowActorParams,
  StoreEidCredentialActorParams,
  ValidateMrtdPoPChallengeActorParams,
  WithItwVersion
} from "./actors";
import {
  AuthenticationContext,
  CieContext,
  Context,
  MrtdPoPContext
} from "./context";
import { EidIssuanceEvents } from "./events";
import { mapEventToFailure } from "./failure";

const notImplemented = () => {
  throw new Error("Not implemented");
};

/** Keeps provider-injected side effects and eID actors fully typed across modules. */
export const itwEidIssuanceMachineSetup = setup({
  types: {
    context: {} as Context,
    events: {} as EidIssuanceEvents
  },
  actions: {
    onInit: notImplemented,

    /**
     * Navigation
     */

    navigateToTosScreen: notImplemented,
    navigateToIpzsPrivacyScreen: notImplemented,
    navigateToIdentificationScreen: notImplemented,
    navigateToIdpSelectionScreen: notImplemented,
    navigateToSpidLoginScreen: notImplemented,
    navigateToCieIdLoginScreen: notImplemented,
    navigateToEidPreviewScreen: notImplemented,
    navigateToSuccessScreen: notImplemented,
    navigateToFailureScreen: notImplemented,
    navigateToWallet: notImplemented,
    navigateToCredentialCatalog: notImplemented,
    navigateToCieNfcPreparationScreen: notImplemented,
    navigateToCiePinPreparationScreen: notImplemented,
    navigateToCieCardPreparationScreen: notImplemented,
    navigateToCieCanPreparationScreen: notImplemented,
    navigateToCiePinScreen: notImplemented,
    navigateToCieAuthenticationScreen: notImplemented,
    navigateToNfcInstructionsScreen: notImplemented,
    navigateToWalletRevocationScreen: notImplemented,
    navigateToCieWarningScreen: notImplemented,
    navigateToCieCanScreen: notImplemented,
    navigateToCieInternalAuthAndMrtdScreen: notImplemented,
    closeIssuance: notImplemented,

    /**
     * Store update
     */

    storeIntegrityKeyTag: notImplemented,
    cleanupIntegrityKeyTag: notImplemented,
    storeWalletInstanceAttestation: notImplemented,
    storeAuthLevel: notImplemented,
    storeWalletActivationFeedbackBannerData: notImplemented,
    storeCredentialUpgradeFailures: notImplemented,
    handleSessionExpired: notImplemented,
    resetWalletInstance: notImplemented,
    refreshCredentialsCatalogue: notImplemented,

    /**
     * Analytics
     */

    trackWalletInstanceCreation: notImplemented,
    trackWalletInstanceRevocation: notImplemented,
    trackIdentificationMethodSelected: notImplemented,
    trackItwIdAuthenticationCompleted: notImplemented,
    trackItwIdVerifiedDocument: notImplemented,
    /**
     * Context manipulation
     */

    setCieIdIdentificationL2: assign(() => ({
      identification: {
        mode: "cieId",
        level: "L2"
      } as const
    })),

    /**
     * Updates the CieID identification level to L3 when IPZS confirms native L3
     * authentication (i.e. challenge_info is absent in the callback URL, meaning
     * no MRTD PoP is required because the CieID app already authenticated at L3).
     */
    updateCieIdIdentificationLevel: assign(({ context, event }) => {
      assertEvent(event, "user-identification-completed");
      if (
        context.identification?.mode !== "cieId" ||
        context.level !== "l3" ||
        isMrtdPoPChallengeRequired(event.authRedirectUrl)
      ) {
        return {};
      }
      return { identification: { mode: "cieId", level: "L3" } as const };
    }),
    setFailure: assign(({ event }) => ({ failure: mapEventToFailure(event) })),
    /**
     * Save the final redirect url in the machine context for later reuse.
     * This action is the same for the three identification methods.
     */
    completeUserIdentification: assign(({ context, event }) => {
      assertEvent(event, "user-identification-completed");
      assert(
        context.authenticationContext,
        "authenticationContext must be defined when completing auth flow"
      );
      return {
        authenticationContext: {
          ...context.authenticationContext,
          callbackUrl: event.authRedirectUrl
        }
      };
    }),
    completeMrtdPoP: assign(({ context, event }) => {
      assertEvent(event, "mrtd-pop-verification-completed");
      assert(
        context.authenticationContext,
        "authenticationContext must be defined when completing auth flow"
      );
      return {
        authenticationContext: {
          ...context.authenticationContext,
          callbackUrl: event.authRedirectUrl
        }
      };
    }),
    trackIntroScreen: notImplemented
  },
  actors: {
    getCieStatus: fromPromise<CieContext>(notImplemented),
    verifyTrustFederation: fromPromise<void, WithItwVersion>(notImplemented),

    /**
     * WI actors
     */

    createWalletInstance: fromPromise<string, CreateWalletInstanceActorParams>(
      notImplemented
    ),
    revokeWalletInstance: fromPromise<void, WithItwVersion>(notImplemented),
    getWalletAttestation: fromPromise<
      WalletInstanceAttestations,
      GetWalletAttestationActorParams
    >(notImplemented),

    /**
     * Primary authentication actors
     */

    startAuthFlow: fromPromise<AuthenticationContext, StartAuthFlowActorParams>(
      notImplemented
    ),

    /**
     * MRTD PoP Challenge actors
     */

    initMrtdPoPChallenge: fromPromise<
      MrtdPoPContext,
      InitMrtdPoPChallengeActorParams
    >(notImplemented),
    validateMrtdPoPChallenge: fromPromise<
      string,
      ValidateMrtdPoPChallengeActorParams
    >(notImplemented),

    /**
     * PID issuance actors
     */

    requestAccessToken: fromPromise<
      CredentialAccessToken,
      RequestAccessTokenActorParams
    >(notImplemented),
    requestEid: fromPromise<RequestEidActorOutput, RequestEidActorParams>(
      notImplemented
    ),
    obtainStatusList: fromPromise<
      ObtainStatusListActorOutput,
      ObtainStatusListActorInput
    >(notImplemented),
    storeEidCredential: fromPromise<void, StoreEidCredentialActorParams>(
      notImplemented
    ),
    waitForSessionRefresh: fromCallback(notImplemented),

    /**
     * Credential upgrade actors
     */

    credentialUpgradeMachine: itwCredentialUpgradeMachine
  },
  guards: {
    issuedEidMatchesAuthenticatedUser: notImplemented,
    isSessionExpired: notImplemented,
    isOperationAborted: notImplemented,
    hasIntegrityKeyTag: ({ context }) => context.integrityKeyTag !== undefined,
    hasValidWalletInstanceAttestation: notImplemented,
    hasCredentialsToUpgrade: ({ context }) =>
      context.credentialsToUpgrade.length > 0,
    isNFCEnabled: ({ context }) => context.cieContext?.isNFCEnabled || false,
    isReissuance: ({ context }) => context.mode === "reissuance",
    isUpgrade: ({ context }) => context.mode === "upgrade",
    isL2Fallback: ({ context }) => context.level === "l2-fallback",
    isL3FeaturesEnabled: ({ context }) => context.level === "l3",
    requiresMrtdVerification: ({ context }) =>
      // MRTD PoP verification is required for SPID and CieID identification modes
      // when issuing an L3 PID and the PID Provider signals a challenge via `challenge_info`.
      context.level === "l3" &&
      context.identification?.mode !== "ciePin" &&
      context.authenticationContext !== undefined &&
      isMrtdPoPChallengeRequired(context.authenticationContext.callbackUrl),
    isWalletValid: notImplemented
  }
});
