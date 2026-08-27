import { assign, fromCallback, fromPromise, setup } from "xstate";

import {
  ProximityCommunicationLogicInput,
  SendDocumentsActorInput,
  SendDocumentsActorOutput,
  SendErrorResponseActorOutput,
  StartEngagementActorInput
} from "./actors";
import { Context } from "./context";
import { ProximityEvents } from "./events";
import { mapEventToFailure } from "./failure";

const notImplemented = () => {
  throw new Error("Not implemented");
};

/** Keeps transport actors and provider-injected side effects typed across presentation states. */
export const itwProximityMachineSetup = setup({
  types: {
    context: {} as Context,
    events: {} as ProximityEvents
  },
  actions: {
    onInit: notImplemented,
    /**
     * Context manipulation
     */

    setFailure: assign(({ event }) => ({ failure: mapEventToFailure(event) })),

    /**
     * Navigation
     */

    navigateToBluetoothPermissionsScreen: notImplemented,
    navigateToBluetoothActivationScreen: notImplemented,
    navigateToNfcActivationScreen: notImplemented,
    navigateToPresentmentScreen: notImplemented,
    navigateToNfcPresentmentScreen: notImplemented,
    navigateToFailureScreen: notImplemented,
    navigateToClaimsDisclosureScreen: notImplemented,
    navigateToStoreconsentScreen: notImplemented,
    navigateToSuccessScreen: notImplemented,
    closeProximity: notImplemented,

    /**
     * Consents
     */

    grantConsent: notImplemented,
    storeConsent: notImplemented,

    /**
     * Analytics
     */

    trackProximityStart: notImplemented,
    trackQrCodeLoadingFailure: notImplemented
  },
  actors: {
    checkBluetoothPermissions: fromPromise<boolean>(notImplemented),
    checkBluetoothActivation: fromPromise<boolean>(notImplemented),
    checkNfcActivation: fromPromise<boolean>(notImplemented),
    proximityCommunicationLogic: fromCallback<
      ProximityEvents,
      ProximityCommunicationLogicInput
    >(notImplemented),
    startEngagement: fromPromise<void, StartEngagementActorInput>(
      notImplemented
    ),
    sendDocuments: fromPromise<
      SendDocumentsActorOutput,
      SendDocumentsActorInput
    >(notImplemented),
    terminateSession: fromPromise<SendErrorResponseActorOutput>(notImplemented)
  },
  guards: {
    hasFailure: ({ context }) => !!context.failure,
    isNfcRetrieval: ({ context }) => context.retrievalMethod === "nfc",
    isNfcEngagement: ({ context }) => context.engagementMode === "nfc",
    hasGrantedConsent: notImplemented
  }
});
