import { assign, fromCallback, fromPromise, setup } from "xstate";

import {
  CredentialAccessToken,
  CredentialBundle
} from "../../common/utils/itwTypesUtils";
import {
  GetWalletAttestationActorOutput,
  ObtainAccessTokenActorInput,
  ObtainCredentialActorInput,
  ObtainCredentialActorOutput,
  ObtainCredentialStatusActorInput,
  ProcessCredentialOfferActorInput,
  ProcessCredentialOfferActorOutput,
  RequestCredentialActorInput,
  RequestCredentialActorOutput,
  VerifyTrustFederationActorInput
} from "./actors";
import { Context } from "./context";
import { CredentialIssuanceEvents } from "./events";
import { mapEventToFailure } from "./failure";

/** Placeholder used to detect provider implementations that were not injected. */
export const notImplemented = () => {
  throw new Error("Not implemented");
};

/** Keeps provider-injected side effects and credential actors fully typed across modules. */
export const itwCredentialSetup = setup({
  types: {
    context: {} as Context,
    events: {} as CredentialIssuanceEvents
  },
  actions: {
    onInit: notImplemented,
    handleSessionExpired: notImplemented,

    /**
     * Context manipulation actions
     */

    setFailure: assign(({ event }) => ({ failure: mapEventToFailure(event) })),

    /**
     * Navigation actions
     */

    navigateToCredentialIntroductionScreen: notImplemented,
    navigateToTrustIssuerScreen: notImplemented,
    navigateToCredentialPreviewScreen: notImplemented,
    navigateToFailureScreen: notImplemented,
    navigateToWallet: notImplemented,
    navigateToEidVerificationExpiredScreen: notImplemented,
    closeIssuance: notImplemented,
    navigateToCardOnboardingScreen: notImplemented,

    /**
     * Store actions
     */

    storeWalletInstanceAttestation: notImplemented,
    storeCredential: notImplemented,

    /**
     * Analytics actions
     */

    trackStartAddCredential: notImplemented,
    trackStartCredentialReissuing: notImplemented,
    trackAddCredential: notImplemented,
    trackCredentialIssuingDataShare: notImplemented,
    trackCredentialIssuingDataShareAccepted: notImplemented
  },
  actors: {
    verifyTrustFederation: fromPromise<void, VerifyTrustFederationActorInput>(
      notImplemented
    ),
    getWalletAttestation:
      fromPromise<GetWalletAttestationActorOutput>(notImplemented),
    requestCredential: fromPromise<
      RequestCredentialActorOutput,
      RequestCredentialActorInput
    >(notImplemented),
    obtainAccessToken: fromPromise<
      CredentialAccessToken,
      ObtainAccessTokenActorInput
    >(notImplemented),
    obtainCredential: fromPromise<
      ObtainCredentialActorOutput,
      ObtainCredentialActorInput
    >(notImplemented),
    obtainCredentialStatus: fromPromise<
      ReadonlyArray<CredentialBundle>,
      ObtainCredentialStatusActorInput
    >(notImplemented),
    processCredentialOffer: fromPromise<
      ProcessCredentialOfferActorOutput,
      ProcessCredentialOfferActorInput
    >(notImplemented),
    waitForSessionRefresh: fromCallback(notImplemented)
  },
  guards: {
    isSessionExpired: notImplemented,
    hasValidWalletInstanceAttestation: notImplemented,
    isEidExpired: notImplemented,
    hasCredentialIntroContent: notImplemented
  }
});
