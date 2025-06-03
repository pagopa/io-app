import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../../navigation/routes";

export const createProximityActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>
) => ({
  navigateToGrantPermissionsScreen: () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PROXIMITY.DEVICE_PERMISSIONS
    });
  },
  closePresentation: () => {
    navigation.popToTop();
  }
});
