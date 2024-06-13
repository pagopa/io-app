/* eslint-disable @typescript-eslint/no-empty-function */
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { itwStoreHardwareKeyTag } from "../../issuance/store/actions";
import { ITW_ROUTES } from "../../navigation/routes";

export const createIssuanceActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>,
  dispatch: ReturnType<typeof useIODispatch>
) => {
  const storeHardwareKeyTag = (_: unknown, params: { keyTag: string }) => {
    dispatch(itwStoreHardwareKeyTag(params.keyTag));
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
    storeHardwareKeyTag,
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
