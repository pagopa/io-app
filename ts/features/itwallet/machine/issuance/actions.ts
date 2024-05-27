/* eslint-disable @typescript-eslint/no-empty-function */
import { useIONavigation } from "../../../../navigation/params/AppParamsList";

export const createIssuanceActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>
) => {
  const storeWalletAttestation = () => {};
  const navigateToTosScreen = () => {};
  const navigateToEidPreviewScreen = () => {};
  const storeEid = () => {};
  const navigateToEidSuccessScreen = () => {};
  const closeIssuance = () => {};
  const navigateToCredentialIdentificationScreen = () => {};
  const navigateToCredentialPreviewScreen = () => {};
  const storeCredential = () => {};
  const navigateToCredentialSuccessScreen = () => {};
  const navigateToWallet = () => {};
  const navigateToFailureScreen = () => {};
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
