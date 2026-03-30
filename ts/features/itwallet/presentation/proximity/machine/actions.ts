import { ActionArgs } from "xstate";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { ITW_PROXIMITY_ROUTES } from "../navigation/routes";
import {
  trackItwProximityQrCode,
  trackItwProximityQrCodeLoadingFailure
} from "../analytics";
import { serializeFailureReason } from "../../../common/utils/itwStoreUtils";
import { Context } from "./context";
import { ProximityEvents } from "./events";
import { mapEventToFailure } from "./failure";

export const createProximityActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>
) => ({
  navigateToGrantPermissionsScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.DEVICE_PERMISSIONS
    });
  },

  navigateToBluetoothActivationScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.BLUETOOTH_ACTIVATION
    });
  },

  navigateToQrCodeScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.QR_CODE
    });
  },

  navigateToClaimsDisclosureScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.CLAIMS_DISCLOSURE
    });
  },

  navigateToSendDocumentsResponseScreen: () => {
    navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
      screen: ITW_PROXIMITY_ROUTES.SEND_DOCUMENTS_RESPONSE
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
