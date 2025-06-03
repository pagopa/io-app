import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { ITW_ROUTES } from "../../../navigation/routes";

export const createProximityActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>
) => ({
  navigateToGrantPermissionsScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PROXIMITY.DEVICE_PERMISSIONS
    });
  },
  navigateToMDLScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
      params: {
        credentialType: CredentialType.DRIVING_LICENSE
      }
    });
  },
  closePresentation: () => {
    navigation.popToTop();
  }
});
