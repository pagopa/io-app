import {
  createStackNavigator,
  TransitionPresets
} from "@react-navigation/stack";
import { isGestureEnabled } from "../../../../../utils/navigation";
import { ItwProximityMachineProvider } from "../machine/provider";
import { ItwBluetoothActivationScreen } from "../screens/ItwBluetoothActivationScreen.tsx";
import { ItwBluetoothPermissionsScreen } from "../screens/ItwBluetoothPermissionsScreen.tsx";
import { ItwNfcActivationScreen } from "../screens/ItwNfcActivationScreen.tsx";
import { ItwProximityClaimsDisclosureScreen } from "../screens/ItwProximityClaimsDisclosureScreen";
import { ItwProximityFailureScreen } from "../screens/ItwProximityFailureScreen";
import { ItwProximityNfcPresentmentScreen } from "../screens/ItwProximityNfcPresentmentScreen.tsx";
import { ItwProximityPresentmentScreen } from "../screens/ItwProximityPresentmentScreen.tsx";
import { ItwProximityStoreConsentScreen } from "../screens/ItwProximityStoreConsentScreen.tsx";
import { ItwProximitySuccessScreen } from "../screens/ItwProximitySuccessScreen.tsx";
import { ItwProximityParamsList } from "./ItwProximityParamsList";
import { ITW_PROXIMITY_ROUTES } from "./routes";

const Stack = createStackNavigator<ItwProximityParamsList>();

const hiddenHeader = { headerShown: false };

export const ItwProximityStackNavigator = () => (
  <ItwProximityMachineProvider>
    <InnerNavigator />
  </ItwProximityMachineProvider>
);

const InnerNavigator = () => (
  <Stack.Navigator
    initialRouteName={ITW_PROXIMITY_ROUTES.PRESENTMENT}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
  >
    <Stack.Screen
      name={ITW_PROXIMITY_ROUTES.BLUETOOTH_PERMISSIONS}
      component={ItwBluetoothPermissionsScreen}
      options={hiddenHeader}
    />
    <Stack.Screen
      name={ITW_PROXIMITY_ROUTES.BLUETOOTH_ACTIVATION}
      component={ItwBluetoothActivationScreen}
      options={hiddenHeader}
    />
    <Stack.Screen
      name={ITW_PROXIMITY_ROUTES.NFC_ACTIVATION}
      component={ItwNfcActivationScreen}
      options={hiddenHeader}
    />
    <Stack.Screen
      name={ITW_PROXIMITY_ROUTES.PRESENTMENT}
      component={ItwProximityPresentmentScreen}
      options={TransitionPresets.ModalSlideFromBottomIOS}
    />
    <Stack.Screen
      name={ITW_PROXIMITY_ROUTES.NFC_PRESENTMENT}
      component={ItwProximityNfcPresentmentScreen}
      options={hiddenHeader}
    />
    <Stack.Screen
      name={ITW_PROXIMITY_ROUTES.CLAIMS_DISCLOSURE}
      component={ItwProximityClaimsDisclosureScreen}
    />
    <Stack.Screen
      name={ITW_PROXIMITY_ROUTES.STORE_CONSENT}
      component={ItwProximityStoreConsentScreen}
      options={hiddenHeader}
    />
    <Stack.Screen
      name={ITW_PROXIMITY_ROUTES.SUCCESS}
      component={ItwProximitySuccessScreen}
      options={hiddenHeader}
    />
    <Stack.Screen
      name={ITW_PROXIMITY_ROUTES.FAILURE}
      component={ItwProximityFailureScreen}
      options={hiddenHeader}
    />
  </Stack.Navigator>
);
