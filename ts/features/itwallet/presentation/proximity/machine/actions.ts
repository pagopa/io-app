import { ActionArgs } from "xstate";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../../navigation/routes";
import {
  trackItwProximityQrCode,
  trackItwProximityQrCodeLoadingFailure
} from "../analytics";
import { serializeFailureReason } from "../../../common/utils/itwStoreUtils";
import { assert } from "../../../../../utils/assert";
import { Context } from "./context";
import { ProximityEvents } from "./events";
import { mapEventToFailure } from "./failure";

export const createProximityActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>
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
    navigation.popToTop();
  },

  navigateToFailureScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PROXIMITY.FAILURE
    });
  },

  closeProximity: ({
    context
  }: ActionArgs<Context, ProximityEvents, ProximityEvents>) => {
    assert(context.credentialType, "credentialType is required");
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
      params: { credentialType: context.credentialType }
    });
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
