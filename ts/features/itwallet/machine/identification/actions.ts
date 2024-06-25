/* eslint-disable @typescript-eslint/no-empty-function */
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";

export default (navigation: ReturnType<typeof useIONavigation>) => {
  const navigateToIdentificationModeScreen = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION
    });
  };
  const navigateToIdpSelectionScreen = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.IDP_SELECTION
    });
  };
  const navigateToCiePinInputScreen = () => {};
  const navigateToCieReadScreen = () => {};
  const navigateToCieFailureScreen = () => {};

  return {
    navigateToIdentificationModeScreen,
    navigateToIdpSelectionScreen,
    navigateToCiePinInputScreen,
    navigateToCieReadScreen,
    navigateToCieFailureScreen
  };
};
