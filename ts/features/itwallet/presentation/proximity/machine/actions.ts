import { assign } from "xstate";
import { StackActions } from "@react-navigation/native";
import NavigationService from "../../../../../navigation/NavigationService";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../../../store/hooks";
import { ITW_ROUTES } from "../../../navigation/routes";
import { itwCredentialsSelector } from "../../../credentials/store/selectors";
import { Context } from "./context";
import { ProximityEvents } from "./events";

export const createProximityActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>,
  store: ReturnType<typeof useIOStore>
) => ({
  onInit: assign<Context, ProximityEvents, unknown, ProximityEvents, any>(
    () => {
      const credentialsByType = itwCredentialsSelector(store.getState());
      return {
        credentialsByType
      };
    }
  ),

  navigateToGrantPermissionsScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PROXIMITY.DEVICE_PERMISSIONS
    });
  },

  navigateToBluetoothActivationScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PROXIMITY.BLUETOOTH_ACTIVATION
    });
  },

  navigateToClaimsDisclosureScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PROXIMITY.CLAIMS_DISCLOSURE
    });
  },

  navigateToFailureScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PROXIMITY.FAILURE
    });
  },

  closeProximity: () => {
    NavigationService.dispatchNavigationAction(StackActions.popToTop());
  }
});
