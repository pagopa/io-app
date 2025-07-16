import { ActionArgs, assign } from "xstate";
import { StackActions } from "@react-navigation/native";
import NavigationService from "../../../../../navigation/NavigationService";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../../../store/hooks";
import ROUTES from "../../../../../navigation/routes";
import { ITW_ROUTES } from "../../../navigation/routes";
import { itwCredentialsSelector } from "../../../credentials/store/selectors";
import { Context } from "./context";
import { ProximityEvents } from "./events";
import {
  trackItwProximityQrCode,
  trackItwProximityQrCodeLoadingFailure
} from "../analytics";

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

  navigateToSendDocumentsResponseScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PROXIMITY.SEND_DOCUMENTS_RESPONSE
    });
  },

  navigateToWallet: () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: ROUTES.MAIN,
          params: {
            screen: ROUTES.WALLET_HOME
          }
        }
      ]
    });
  },

  navigateToFailureScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PROXIMITY.FAILURE
    });
  },

  closeProximity: () => {
    NavigationService.dispatchNavigationAction(StackActions.popToTop());
  },

  trackQrCodeGenerationOutcome: ({
    context
  }: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
    if (context.isQRCodeGenerationError) {
      trackItwProximityQrCodeLoadingFailure();
    } else {
      trackItwProximityQrCode();
    }
  }
});
