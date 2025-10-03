import { ActionArgs } from "xstate";
import { StackActions } from "@react-navigation/native";
import NavigationService from "../../../../../navigation/NavigationService";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../../navigation/routes";
import { ITW_ROUTES } from "../../../navigation/routes";
import {
  trackItwProximityQrCode,
  trackItwProximityQrCodeLoadingFailure
} from "../analytics";
import { serializeFailureReason } from "../../../common/utils/itwStoreUtils";
import { useIOStore } from "../../../../../store/hooks";
import { isConnectedSelector } from "../../../../connectivity/store/selectors";
import { Context } from "./context";
import { ProximityEvents } from "./events";
import { mapEventToFailure } from "./failure";

export const createProximityActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>,
  store: ReturnType<typeof useIOStore>
) => ({
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
    const isConnected = isConnectedSelector(store.getState());

    const route = !isConnected
      ? {
          name: ITW_ROUTES.MAIN,
          params: { screen: ITW_ROUTES.OFFLINE.WALLET }
        }
      : {
          name: ROUTES.MAIN,
          params: { screen: ROUTES.WALLET_HOME }
        };

    navigation.reset({
      index: 0,
      routes: [route]
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
    context,
    event
  }: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
    if (context.isQRCodeGenerationError) {
      const failure = mapEventToFailure(event);
      const serializedFailure = serializeFailureReason(failure);
      trackItwProximityQrCodeLoadingFailure(serializedFailure);
    } else {
      trackItwProximityQrCode();
    }
  }
});
