import { assertEvent, assign, setup } from "xstate";

import { assert } from "../../../../utils/assert.ts";
import { isMrtdPoPChallengeRequired } from "../../common/utils/mrtdUrl";
import { itwCredentialUpgradeMachine } from "../upgrade/machine.ts";
import { waitForSessionRefreshActor } from "../utils/actors";
import {
  cleanupIntegrityKeyTagAction,
  closeIssuanceAction,
  handleSessionExpiredAction,
  navigateToCieAuthenticationScreenAction,
  navigateToCieCanPreparationScreenAction,
  navigateToCieCanScreenAction,
  navigateToCieCardPreparationScreenAction,
  navigateToCieIdLoginScreenAction,
  navigateToCieInternalAuthAndMrtdScreenAction,
  navigateToCieNfcPreparationScreenAction,
  navigateToCiePinPreparationScreenAction,
  navigateToCiePinScreenAction,
  navigateToCieWarningScreenAction,
  navigateToCredentialCatalogAction,
  navigateToEidPreviewScreenAction,
  navigateToFailureScreenAction,
  navigateToIdentificationScreenAction,
  navigateToIdpSelectionScreenAction,
  navigateToIpzsPrivacyScreenAction,
  navigateToNfcInstructionsScreenAction,
  navigateToSpidLoginScreenAction,
  navigateToSuccessScreenAction,
  navigateToTosScreenAction,
  navigateToWalletAction,
  navigateToWalletRevocationScreenAction,
  onInitAction,
  refreshCredentialsCatalogueAction,
  resetWalletInstanceAction,
  storeAuthLevelAction,
  storeCredentialUpgradeFailuresAction,
  storeIntegrityKeyTagAction,
  storeWalletActivationFeedbackBannerDataAction,
  storeWalletInstanceAttestationAction,
  trackIdentificationMethodSelectedAction,
  trackIntroScreenAction,
  trackItwIdAuthenticationCompletedAction,
  trackItwIdVerifiedDocumentAction,
  trackWalletInstanceCreationAction,
  trackWalletInstanceRevocationAction
} from "./actions";
import {
  createWalletInstanceActor,
  getCieStatusActor,
  getWalletAttestationActor,
  initMrtdPoPChallengeActor,
  obtainStatusListActor,
  requestAccessTokenActor,
  requestEidActor,
  revokeWalletInstanceActor,
  startAuthFlowActor,
  storeEidCredentialActor,
  validateMrtdPoPChallengeActor,
  verifyTrustFederationActor
} from "./actors";
import { Context, IdentificationContext } from "./context";
import { EidIssuanceEvents } from "./events";
import { mapEventToFailure } from "./failure";
import {
  hasValidWalletInstanceAttestationGuard,
  isSessionExpiredGuard,
  issuedEidMatchesAuthenticatedUserGuard,
  isWalletValidGuard
} from "./guards";
import { Input } from "./input";

const notImplemented = () => {
  throw new Error("Not implemented");
};

/** Keeps provider-injected side effects and eID actors fully typed across modules. */
export const itwEidIssuanceMachineSetup = setup({
  types: {
    context: {} as Context,
    events: {} as EidIssuanceEvents,
    input: {} as Input
  },
  actions: {
    onInit: onInitAction,

    /**
     * Navigation
     */

    navigateToTosScreen: navigateToTosScreenAction,
    navigateToIpzsPrivacyScreen: navigateToIpzsPrivacyScreenAction,
    navigateToIdentificationScreen: navigateToIdentificationScreenAction,
    navigateToIdpSelectionScreen: navigateToIdpSelectionScreenAction,
    navigateToSpidLoginScreen: navigateToSpidLoginScreenAction,
    navigateToCieIdLoginScreen: navigateToCieIdLoginScreenAction,
    navigateToEidPreviewScreen: navigateToEidPreviewScreenAction,
    navigateToSuccessScreen: navigateToSuccessScreenAction,
    navigateToFailureScreen: navigateToFailureScreenAction,
    navigateToWallet: navigateToWalletAction,
    navigateToCredentialCatalog: navigateToCredentialCatalogAction,
    navigateToCieNfcPreparationScreen: navigateToCieNfcPreparationScreenAction,
    navigateToCiePinPreparationScreen: navigateToCiePinPreparationScreenAction,
    navigateToCieCardPreparationScreen:
      navigateToCieCardPreparationScreenAction,
    navigateToCieCanPreparationScreen: navigateToCieCanPreparationScreenAction,
    navigateToCiePinScreen: navigateToCiePinScreenAction,
    navigateToCieAuthenticationScreen: navigateToCieAuthenticationScreenAction,
    navigateToNfcInstructionsScreen: navigateToNfcInstructionsScreenAction,
    navigateToWalletRevocationScreen: navigateToWalletRevocationScreenAction,
    navigateToCieWarningScreen: navigateToCieWarningScreenAction,
    navigateToCieCanScreen: navigateToCieCanScreenAction,
    navigateToCieInternalAuthAndMrtdScreen:
      navigateToCieInternalAuthAndMrtdScreenAction,
    closeIssuance: closeIssuanceAction,

    /**
     * Store update
     */

    storeIntegrityKeyTag: storeIntegrityKeyTagAction,
    cleanupIntegrityKeyTag: cleanupIntegrityKeyTagAction,
    storeWalletInstanceAttestation: storeWalletInstanceAttestationAction,
    storeAuthLevel: storeAuthLevelAction,
    storeWalletActivationFeedbackBannerData:
      storeWalletActivationFeedbackBannerDataAction,
    storeCredentialUpgradeFailures: storeCredentialUpgradeFailuresAction,
    handleSessionExpired: handleSessionExpiredAction,
    resetWalletInstance: resetWalletInstanceAction,
    refreshCredentialsCatalogue: refreshCredentialsCatalogueAction,

    /**
     * Analytics
     */

    trackWalletInstanceCreation: trackWalletInstanceCreationAction,
    trackWalletInstanceRevocation: trackWalletInstanceRevocationAction,
    trackIdentificationMethodSelected: trackIdentificationMethodSelectedAction,
    trackItwIdAuthenticationCompleted: trackItwIdAuthenticationCompletedAction,
    trackItwIdVerifiedDocument: trackItwIdVerifiedDocumentAction,
    /**
     * Context manipulation
     */

    setCieIdIdentificationL2: assign(() => ({
      identification: {
        mode: "cieId",
        level: "L2"
      } satisfies IdentificationContext
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
      return {
        identification: {
          mode: "cieId",
          level: "L3"
        } satisfies IdentificationContext
      };
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
    trackIntroScreen: trackIntroScreenAction
  },
  actors: {
    getCieStatus: getCieStatusActor,
    verifyTrustFederation: verifyTrustFederationActor,

    /**
     * WI actors
     */

    createWalletInstance: createWalletInstanceActor,
    revokeWalletInstance: revokeWalletInstanceActor,
    getWalletAttestation: getWalletAttestationActor,

    /**
     * Primary authentication actors
     */

    startAuthFlow: startAuthFlowActor,

    /**
     * MRTD PoP Challenge actors
     */

    initMrtdPoPChallenge: initMrtdPoPChallengeActor,
    validateMrtdPoPChallenge: validateMrtdPoPChallengeActor,

    /**
     * PID issuance actors
     */

    requestAccessToken: requestAccessTokenActor,
    requestEid: requestEidActor,
    obtainStatusList: obtainStatusListActor,
    storeEidCredential: storeEidCredentialActor,
    waitForSessionRefresh: waitForSessionRefreshActor,

    /**
     * Credential upgrade actors
     */

    credentialUpgradeMachine: itwCredentialUpgradeMachine
  },
  guards: {
    issuedEidMatchesAuthenticatedUser: issuedEidMatchesAuthenticatedUserGuard,
    isSessionExpired: isSessionExpiredGuard,
    isOperationAborted: notImplemented,
    hasIntegrityKeyTag: ({ context }) => context.integrityKeyTag !== undefined,
    hasValidWalletInstanceAttestation: hasValidWalletInstanceAttestationGuard,
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
    isWalletValid: isWalletValidGuard
  }
});
