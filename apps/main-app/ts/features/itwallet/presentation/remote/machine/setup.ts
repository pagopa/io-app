import { assign, fromPromise, setup } from "xstate";

import { type WalletInstanceAttestations } from "../../../common/utils/itwTypesUtils";
import {
  EvaluateRelyingPartyTrustInput,
  EvaluateRelyingPartyTrustOutput,
  GetPresentationDetailsInput,
  GetPresentationDetailsOutput,
  GetRequestObjectInput,
  GetRequestObjectOutput,
  SendAuthorizationResponseInput,
  SendAuthorizationResponseOutput
} from "./actors";
import { Context } from "./context";
import { RemoteEvents } from "./events";
import { mapEventToFailure } from "./failure";

const notImplemented = () => {
  throw new Error("Not implemented");
};

/** Defines typed remote-presentation actors while providers inject runtime side effects. */
export const itwRemoteMachineSetup = setup({
  types: {
    context: {} as Context,
    events: {} as RemoteEvents
  },
  actions: {
    onInit: notImplemented,
    setFailure: assign(({ event }) => ({ failure: mapEventToFailure(event) })),
    navigateToFailureScreen: notImplemented,
    navigateToDiscoveryScreen: notImplemented,
    navigateToClaimsDisclosureScreen: notImplemented,
    navigateToIdentificationModeScreen: notImplemented,
    navigateToAuthResponseScreen: notImplemented,
    navigateToBarcodeScanScreen: notImplemented,
    closePresentation: notImplemented,
    trackRemoteDataShare: notImplemented,
    storeWalletInstanceAttestation: notImplemented,
    handleSessionExpired: notImplemented,
    consumePresentedBatchCredentials: notImplemented
  },
  actors: {
    evaluateRelyingPartyTrust: fromPromise<
      EvaluateRelyingPartyTrustOutput,
      EvaluateRelyingPartyTrustInput
    >(notImplemented),
    getRequestObject: fromPromise<
      GetRequestObjectOutput,
      GetRequestObjectInput
    >(notImplemented),
    getPresentationDetails: fromPromise<
      GetPresentationDetailsOutput,
      GetPresentationDetailsInput
    >(notImplemented),
    sendAuthorizationResponse: fromPromise<
      SendAuthorizationResponseOutput,
      SendAuthorizationResponseInput
    >(notImplemented),
    getWalletAttestation:
      fromPromise<WalletInstanceAttestations>(notImplemented)
  },
  guards: {
    isItWalletL3Active: notImplemented,
    isSessionExpired: notImplemented,
    hasValidWalletInstanceAttestation: notImplemented,
    isOpenIdFederationClient: notImplemented,
    isX509HashClient: notImplemented
  }
});
