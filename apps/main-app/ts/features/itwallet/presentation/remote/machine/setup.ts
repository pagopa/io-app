import { assign, setup } from "xstate";

import {
  closePresentationAction,
  consumePresentedBatchCredentialsAction,
  handleSessionExpiredAction,
  navigateToAuthResponseScreenAction,
  navigateToBarcodeScanScreenAction,
  navigateToClaimsDisclosureScreenAction,
  navigateToDiscoveryScreenAction,
  navigateToFailureScreenAction,
  onInitAction,
  storeWalletInstanceAttestationAction,
  trackRemoteDataShareAction
} from "./actions";
import {
  evaluateRelyingPartyTrustActor,
  getPresentationDetailsActor,
  getRequestObjectActor,
  getWalletAttestationActor,
  sendAuthorizationResponseActor
} from "./actors";
import { Context } from "./context";
import { RemoteEvents } from "./events";
import { mapEventToFailure } from "./failure";
import {
  hasValidWalletInstanceAttestationGuard,
  isItWalletL3ActiveGuard,
  isOpenIdFederationClientGuard,
  isSessionExpiredGuard,
  isX509HashClientGuard
} from "./guards";
import { Input } from "./input";

const notImplemented = () => {
  throw new Error("Not implemented");
};

/** Defines typed remote-presentation actors while providers inject runtime side effects. */
export const itwRemoteMachineSetup = setup({
  types: {
    context: {} as Context,
    events: {} as RemoteEvents,
    input: {} as Input
  },
  actions: {
    onInit: onInitAction,
    setFailure: assign(({ event }) => ({ failure: mapEventToFailure(event) })),
    navigateToFailureScreen: navigateToFailureScreenAction,
    navigateToDiscoveryScreen: navigateToDiscoveryScreenAction,
    navigateToClaimsDisclosureScreen: navigateToClaimsDisclosureScreenAction,
    navigateToIdentificationModeScreen: notImplemented,
    navigateToAuthResponseScreen: navigateToAuthResponseScreenAction,
    navigateToBarcodeScanScreen: navigateToBarcodeScanScreenAction,
    closePresentation: closePresentationAction,
    trackRemoteDataShare: trackRemoteDataShareAction,
    storeWalletInstanceAttestation: storeWalletInstanceAttestationAction,
    handleSessionExpired: handleSessionExpiredAction,
    consumePresentedBatchCredentials: consumePresentedBatchCredentialsAction
  },
  actors: {
    evaluateRelyingPartyTrust: evaluateRelyingPartyTrustActor,
    getRequestObject: getRequestObjectActor,
    getPresentationDetails: getPresentationDetailsActor,
    sendAuthorizationResponse: sendAuthorizationResponseActor,
    getWalletAttestation: getWalletAttestationActor
  },
  guards: {
    isItWalletL3Active: isItWalletL3ActiveGuard,
    isSessionExpired: isSessionExpiredGuard,
    hasValidWalletInstanceAttestation: hasValidWalletInstanceAttestationGuard,
    isOpenIdFederationClient: isOpenIdFederationClientGuard,
    isX509HashClient: isX509HashClientGuard
  }
});
