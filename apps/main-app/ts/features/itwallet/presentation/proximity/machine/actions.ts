import { ActionArgs, assign } from "xstate";

import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../../../store/hooks";
import { assert } from "../../../../../utils/assert";
import {
  trackItwProximityQrCodeLoadingFailure,
  trackItwProximityStart
} from "../analytics";
import { ITW_PROXIMITY_ROUTES } from "../navigation/routes";
import { itwGrantProximityConsent } from "../store/actions";
import { itwPresentableCredentialsByDocTypeSelector } from "../store/selectors/credentials";
import {
  generateConsentKey,
  getConsentDataFromProximityDetails
} from "../store/utils";
import { Context } from "./context";
import { ProximityEvents } from "./events";
import { mapEventToFailure } from "./failure";

export const createProximityActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>,
  store: ReturnType<typeof useIOStore>
) => ({
  onInit: assign<Context, ProximityEvents, unknown, ProximityEvents, any>(
    () => {
      const state = store.getState();

      return {
        credentials: itwPresentableCredentialsByDocTypeSelector(state)
      };
    }
  ),

  navigateToBluetoothPermissionsScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.BLUETOOTH_PERMISSIONS
    });
  },

  navigateToBluetoothActivationScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.BLUETOOTH_ACTIVATION
    });
  },

  navigateToNfcActivationScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.NFC_ACTIVATION
    });
  },

  navigateToNfcPresentmentScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.NFC_PRESENTMENT
    });
  },

  navigateToPresentmentScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.PRESENTMENT,
      params: {}
    });
  },

  navigateToClaimsDisclosureScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.CLAIMS_DISCLOSURE
    });
  },

  navigateToStoreconsentScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.STORE_CONSENT
    });
  },

  navigateToSuccessScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.SUCCESS
    });
  },

  navigateToFailureScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.FAILURE
    });
  },

  closeProximity: () => {
    navigation.pop();
  },

  grantConsent: assign<Context, ProximityEvents, unknown, ProximityEvents, any>(
    ({ context }: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
      assert(
        context.proximityDetails,
        "ProximityDetails must be present in context to grant consent"
      );

      const consentData = getConsentDataFromProximityDetails(
        context.proximityDetails
      );

      return { grantedConsentKey: generateConsentKey(consentData) };
    }
  ),

  storeConsent: ({
    context
  }: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
    assert(
      context.proximityDetails,
      "ProximityDetails must be present in context to store consent"
    );

    const consentData = getConsentDataFromProximityDetails(
      context.proximityDetails
    );

    store.dispatch(itwGrantProximityConsent(consentData));
  },

  trackProximityStart: ({
    context
  }: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
    trackItwProximityStart({
      proximity_flow: context.engagementMode === "nfc" ? "nfc" : "qr_code"
    });
  },

  trackQrCodeLoadingFailure: ({
    context,
    event
  }: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
    if (context.engagementMode === "qrcode") {
      const { reason, type } = mapEventToFailure(event);
      trackItwProximityQrCodeLoadingFailure({ reason, type });
    }
  }
});
