import { ISO18013_5 } from "@pagopa/io-react-native-iso18013";
import { ActionArgs, assign } from "xstate";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../../../store/hooks";
import { assert } from "../../../../../utils/assert";
import { ITW_PROXIMITY_ROUTES } from "../navigation/routes";
import { itwGrantProximityConsent } from "../store/actions";
import { itwPresentableCredentialsByDocTypeSelector } from "../store/selectors/credentials";
import { getConsentDataFromProximityDetails } from "../store/utils";
import { Context } from "./context";
import { ProximityEvents } from "./events";

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
      screen: ITW_PROXIMITY_ROUTES.BLUETOOTH_PERMISSIONS,
      pop: true
    });
  },

  navigateToBluetoothActivationScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.BLUETOOTH_ACTIVATION,
      pop: true
    });
  },

  navigateToNfcActivationScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.BLUETOOTH_ACTIVATION,
      pop: true
    });
  },

  navigateToNfcPresentmentScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.NFC_PRESENTMENT,
      pop: true
    });
  },

  navigateToPresentmentScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.PRESENTMENT,
      params: {},
      pop: true
    });
  },

  navigateToClaimsDisclosureScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.CLAIMS_DISCLOSURE,
      pop: true
    });
  },

  navigateToStoreconsentScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.STORE_CONSENT,
      pop: true
    });
  },

  navigateToSuccessScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.SUCCESS,
      pop: true
    });
  },

  navigateToFailureScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.FAILURE,
      pop: true
    });
  },

  closeProximity: () => {
    navigation.pop();
  },

  attemptSessionTermination: () => {
    ISO18013_5.sendErrorResponse(ISO18013_5.ErrorCode.SESSION_TERMINATED).catch(
      () => null
    );
  },

  storeConsent: ({
    context
  }: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
    assert(
      context.proximityDetails,
      "ProximityDetails must be present in context to store consent"
    );

    const consentData = getConsentDataFromProximityDetails(
      "IPZS", // TODO - use actual RP ID when available instead of hardcoding
      context.proximityDetails
    );

    store.dispatch(itwGrantProximityConsent(consentData));
  }
});
