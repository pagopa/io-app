import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { ITW_PLAYGROUND_ROUTES } from "../../navigation/routes";

export const createProximityActionsImplementation = (
  navigation: ReturnType<typeof useIONavigation>
) => ({
  navigateToGrantPermissionsScreen: () => {
    navigation.navigate(ITW_PLAYGROUND_ROUTES.MAIN, {
      screen: ITW_PLAYGROUND_ROUTES.DEVICE_PERMISSIONS
    });
  },
  navigateToBluetoothActivationScreen: () => {
    navigation.navigate(ITW_PLAYGROUND_ROUTES.MAIN, {
      screen: ITW_PLAYGROUND_ROUTES.BLUETOOTH_ACTIVATION
    });
  },
  closePresentation: () => {
    navigation.popToTop();
  }
});
