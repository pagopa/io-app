import { ActionArgs, assign } from "xstate";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../../../store/hooks";
import { serializeFailureReason } from "../../../common/utils/itwStoreUtils";
import { itwCredentialsAllSelector } from "../../../credentials/store/selectors";
import { ITW_ROUTES } from "../../../navigation/routes";
import { itwWalletInstanceAttestationSelector } from "../../../walletInstance/store/selectors";
import {
  trackItwProximityQrCode,
  trackItwProximityQrCodeLoadingFailure
} from "../analytics";
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
        walletInstanceAttestation: itwWalletInstanceAttestationSelector(state),
        credentials: itwCredentialsAllSelector(state)
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
    navigation.popToTop();
  },

  navigateToFailureScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PROXIMITY.FAILURE
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
