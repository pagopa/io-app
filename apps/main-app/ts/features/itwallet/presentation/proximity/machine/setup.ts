import { assign, setup } from "xstate";

import {
  closeProximityAction,
  grantConsentAction,
  navigateToBluetoothActivationScreenAction,
  navigateToBluetoothPermissionsScreenAction,
  navigateToClaimsDisclosureScreenAction,
  navigateToFailureScreenAction,
  navigateToNfcActivationScreenAction,
  navigateToNfcPresentmentScreenAction,
  navigateToPresentmentScreenAction,
  navigateToStoreconsentScreenAction,
  navigateToSuccessScreenAction,
  onInitAction,
  storeConsentAction,
  trackProximityStartAction,
  trackQrCodeLoadingFailureAction
} from "./actions";
import {
  checkBluetoothActivationActor,
  checkBluetoothPermissionsActor,
  checkNfcActivationActor,
  proximityCommunicationLogicActor,
  sendDocumentsActor,
  startEngagementActor,
  terminateSessionActor
} from "./actors";
import { Context } from "./context";
import { ProximityEvents } from "./events";
import { mapEventToFailure } from "./failure";
import { hasGrantedConsentGuard } from "./guards";
import { Input } from "./input";

/** Keeps transport actors and provider-injected side effects typed across presentation states. */
export const itwProximityMachineSetup = setup({
  types: {
    context: {} as Context,
    input: {} as Input,
    events: {} as ProximityEvents
  },
  actions: {
    onInit: onInitAction,
    /**
     * Context manipulation
     */

    setFailure: assign(({ event }) => ({ failure: mapEventToFailure(event) })),

    /**
     * Navigation
     */

    navigateToBluetoothPermissionsScreen:
      navigateToBluetoothPermissionsScreenAction,
    navigateToBluetoothActivationScreen:
      navigateToBluetoothActivationScreenAction,
    navigateToNfcActivationScreen: navigateToNfcActivationScreenAction,
    navigateToPresentmentScreen: navigateToPresentmentScreenAction,
    navigateToNfcPresentmentScreen: navigateToNfcPresentmentScreenAction,
    navigateToFailureScreen: navigateToFailureScreenAction,
    navigateToClaimsDisclosureScreen: navigateToClaimsDisclosureScreenAction,
    navigateToStoreconsentScreen: navigateToStoreconsentScreenAction,
    navigateToSuccessScreen: navigateToSuccessScreenAction,
    closeProximity: closeProximityAction,

    /**
     * Consents
     */

    grantConsent: grantConsentAction,
    storeConsent: storeConsentAction,

    /**
     * Analytics
     */

    trackProximityStart: trackProximityStartAction,
    trackQrCodeLoadingFailure: trackQrCodeLoadingFailureAction
  },
  actors: {
    checkBluetoothPermissions: checkBluetoothPermissionsActor,
    checkBluetoothActivation: checkBluetoothActivationActor,
    checkNfcActivation: checkNfcActivationActor,
    proximityCommunicationLogic: proximityCommunicationLogicActor,
    startEngagement: startEngagementActor,
    sendDocuments: sendDocumentsActor,
    terminateSession: terminateSessionActor
  },
  guards: {
    hasFailure: ({ context }) => !!context.failure,
    isNfcRetrieval: ({ context }) => context.retrievalMethod === "nfc",
    isNfcEngagement: ({ context }) => context.engagementMode === "nfc",
    hasGrantedConsent: hasGrantedConsentGuard
  }
});
