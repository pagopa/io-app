/* eslint-disable @typescript-eslint/no-empty-function */
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

export default (navigation: ReturnType<typeof useIONavigation>) => ({
  navigateToAuthDataScreen: () => {},

  navigateToCredentialPreviewScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW
    });
  },

  navigateToFailureScreen: () => {},

  navigateToWallet: () => {},

  storeCredential: () => {},

  closeIssuance: () => {
    navigation.popToTop();
  }
});
