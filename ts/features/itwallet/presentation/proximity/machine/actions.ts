import { assign } from "xstate";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../../../store/hooks";
import { itwWalletInstanceAttestationSelector } from "../../../walletInstance/store/selectors";
import { ITW_PROXIMITY_ROUTES } from "../navigation/routes";
import { itwPresentableCredentialsByDocTypeSelector } from "../store/selectors/credentials";
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
        walletInstanceAttestation: itwWalletInstanceAttestationSelector(state),
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
      screen: ITW_PROXIMITY_ROUTES.BLUETOOTH_ACTIVATION
    });
  },

  navigateToPresentmentScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.PRESENTMENT,
      params: {}
    });
  },

  navigateToNfcPresentmentScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.NFC_PRESENTMENT
    });
  },

  navigateToClaimsDisclosureScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.CLAIMS_DISCLOSURE
    });
  },

  navigateToSuccessScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.SUCCESS
    });
  },

  navigateToWallet: () => {
    navigation.pop();
  },

  navigateToFailureScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.FAILURE
    });
  },

  closeProximity: () => {
    navigation.pop();
  }
});
