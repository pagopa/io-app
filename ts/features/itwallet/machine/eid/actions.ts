/* eslint-disable @typescript-eslint/no-empty-function */
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

export default (navigation: ReturnType<typeof useIONavigation>) => ({
  navigateToTosScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO
    });
  },

  navigateToEidPreviewScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.EID_PREVIEW
    });
  },

  navigateToSuccessScreen: () => {
    navigation.popToTop();
  },

  navigateToFailureScreen: () => {},

  navigateToWallet: () => {},

  navigateToCredentialCatalog: () => {},

  closeIssuance: () => {
    navigation.popToTop();
  },

  storeWalletAttestation: () => {},

  storeEidCredential: () => {},

  requestAssistance: () => {}
});
