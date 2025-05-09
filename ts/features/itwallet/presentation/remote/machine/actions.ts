import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { ITW_REMOTE_ROUTES } from "../navigation/routes.ts";
import { ITW_ROUTES } from "../../../navigation/routes.ts";
import ROUTES from "../../../../../navigation/routes.ts";

export const createRemoteActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>
) => ({
  navigateToFailureScreen: () => {
    navigation.navigate(ITW_REMOTE_ROUTES.MAIN, {
      screen: ITW_REMOTE_ROUTES.FAILURE
    });
  },

  navigateToDiscoveryScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO
    });
  },

  navigateToClaimsDisclosureScreen: () => {
    navigation.navigate(ITW_REMOTE_ROUTES.MAIN, {
      screen: ITW_REMOTE_ROUTES.CLAIMS_DISCLOSURE
    });
  },

  navigateToBarcodeScanScreen: () => {
    navigation.navigate(ROUTES.BARCODE_SCAN);
  },

  navigateToAuthResponseScreen: () => {
    navigation.navigate(ITW_REMOTE_ROUTES.MAIN, {
      screen: ITW_REMOTE_ROUTES.AUTH_RESPONSE
    });
  },

  closePresentation: () => {
    navigation.popToTop();
  }
});
