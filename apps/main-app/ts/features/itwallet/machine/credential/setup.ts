import { assign, setup } from "xstate";

import { waitForSessionRefreshActor } from "../utils/actors";
import {
  closeIssuanceAction,
  handleSessionExpiredAction,
  navigateToCardOnboardingScreenAction,
  navigateToCredentialIntroductionScreenAction,
  navigateToCredentialPreviewScreenAction,
  navigateToEidVerificationExpiredScreenAction,
  navigateToFailureScreenAction,
  navigateToTrustIssuerScreenAction,
  navigateToWalletAction,
  onInitAction,
  storeCredentialAction,
  storeWalletInstanceAttestationAction,
  trackAddCredentialAction,
  trackCredentialIssuingDataShareAcceptedAction,
  trackCredentialIssuingDataShareAction,
  trackStartAddCredentialAction,
  trackStartCredentialReissuingAction
} from "./actions";
import {
  getWalletAttestationActor,
  obtainAccessTokenActor,
  obtainCredentialActor,
  obtainCredentialStatusActor,
  processCredentialOfferActor,
  requestCredentialActor,
  verifyTrustFederationActor
} from "./actors";
import { Context } from "./context";
import { CredentialIssuanceEvents } from "./events";
import { mapEventToFailure } from "./failure";
import {
  hasCredentialIntroContentGuard,
  hasValidWalletInstanceAttestationGuard,
  isEidExpiredGuard,
  isSessionExpiredGuard
} from "./guards";
import { Input } from "./input";

/** Placeholder used to detect provider implementations that were not injected. */
export const notImplemented = () => {
  throw new Error("Not implemented");
};

/** Keeps provider-injected side effects and credential actors fully typed across modules. */
export const itwCredentialSetup = setup({
  types: {
    context: {} as Context,
    input: {} as Input,
    events: {} as CredentialIssuanceEvents
  },
  actions: {
    onInit: onInitAction,
    handleSessionExpired: handleSessionExpiredAction,

    /**
     * Context manipulation actions
     */

    setFailure: assign(({ event }) => ({ failure: mapEventToFailure(event) })),

    /**
     * Navigation actions
     */

    navigateToCredentialIntroductionScreen:
      navigateToCredentialIntroductionScreenAction,
    navigateToTrustIssuerScreen: navigateToTrustIssuerScreenAction,
    navigateToCredentialPreviewScreen: navigateToCredentialPreviewScreenAction,
    navigateToFailureScreen: navigateToFailureScreenAction,
    navigateToWallet: navigateToWalletAction,
    navigateToEidVerificationExpiredScreen:
      navigateToEidVerificationExpiredScreenAction,
    closeIssuance: closeIssuanceAction,
    navigateToCardOnboardingScreen: navigateToCardOnboardingScreenAction,

    /**
     * Store actions
     */

    storeWalletInstanceAttestation: storeWalletInstanceAttestationAction,
    storeCredential: storeCredentialAction,

    /**
     * Analytics actions
     */

    trackStartAddCredential: trackStartAddCredentialAction,
    trackStartCredentialReissuing: trackStartCredentialReissuingAction,
    trackAddCredential: trackAddCredentialAction,
    trackCredentialIssuingDataShare: trackCredentialIssuingDataShareAction,
    trackCredentialIssuingDataShareAccepted:
      trackCredentialIssuingDataShareAcceptedAction
  },
  actors: {
    verifyTrustFederation: verifyTrustFederationActor,
    getWalletAttestation: getWalletAttestationActor,
    requestCredential: requestCredentialActor,
    obtainAccessToken: obtainAccessTokenActor,
    obtainCredential: obtainCredentialActor,
    obtainCredentialStatus: obtainCredentialStatusActor,
    processCredentialOffer: processCredentialOfferActor,
    waitForSessionRefresh: waitForSessionRefreshActor
  },
  guards: {
    isSessionExpired: isSessionExpiredGuard,
    hasValidWalletInstanceAttestation: hasValidWalletInstanceAttestationGuard,
    isEidExpired: isEidExpiredGuard,
    hasCredentialIntroContent: hasCredentialIntroContentGuard
  }
});
