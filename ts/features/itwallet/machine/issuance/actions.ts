/* eslint-disable @typescript-eslint/no-empty-function */
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

export const createIssuanceActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>
) => {
  const storeWalletAttestation = (_: unknown, _params: { wte: string }) => {
    // console.log(params.wte);
  };

  const storeEid = () => {};

  const storeCredential = () => {};

  const navigateToTosScreen = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.INFO
    });
  };

  const navigateToEidPreviewScreen = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.EID_PREVIEW
    });
  };

  const navigateToEidSuccessScreen = () => {
    navigation.popToTop();
  };
  const navigateToCredentialIdentificationScreen = () => {};

  const navigateToCredentialPreviewScreen = () => {};

  const navigateToCredentialSuccessScreen = () => {};

  const navigateToWallet = () => {};

  const navigateToFailureScreen = () => {};

  const closeIssuance = () => {};

  const requestAssistance = () => {};

  return {
    storeWalletAttestation,
    navigateToTosScreen,
    navigateToEidPreviewScreen,
    storeEid,
    navigateToEidSuccessScreen,
    closeIssuance,
    navigateToCredentialIdentificationScreen,
    navigateToCredentialPreviewScreen,
    storeCredential,
    navigateToCredentialSuccessScreen,
    navigateToWallet,
    navigateToFailureScreen,
    requestAssistance
  };
};
