import { ActionArgs, assign } from "xstate";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { serializeFailureReason } from "../../../common/utils/itwStoreUtils";
import { trackItwProximityQrCodeLoadingFailure } from "../analytics";
import { ITW_PROXIMITY_ROUTES } from "../navigation/routes";
import { useIOStore } from "../../../../../store/hooks";
import { itwWalletInstanceAttestationSelector } from "../../../walletInstance/store/selectors";
import { itwPresentableCredentialsByDocTypeSelector } from "../store/selectors";
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
        credentials: itwPresentableCredentialsByDocTypeSelector(state)
      };
    }
  ),

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
    if (context.failure) {
      const failure = mapEventToFailure(event);
      const serializedFailure = serializeFailureReason(failure);
      trackItwProximityQrCodeLoadingFailure(serializedFailure);
    }
  }
});
