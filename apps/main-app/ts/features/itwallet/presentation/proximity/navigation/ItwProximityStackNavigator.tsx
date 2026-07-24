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
      component={ItwBluetoothPermissionsScreen}
      name={ITW_PROXIMITY_ROUTES.BLUETOOTH_PERMISSIONS}
      options={hiddenHeader}
    />
    <Stack.Screen
      component={ItwBluetoothActivationScreen}
      name={ITW_PROXIMITY_ROUTES.BLUETOOTH_ACTIVATION}
      options={hiddenHeader}
    />
    <Stack.Screen
      component={ItwNfcActivationScreen}
      name={ITW_PROXIMITY_ROUTES.NFC_ACTIVATION}
      options={hiddenHeader}
    />
    <Stack.Screen
      component={ItwProximityPresentmentScreen}
      name={ITW_PROXIMITY_ROUTES.PRESENTMENT}
      options={TransitionPresets.ModalSlideFromBottomIOS}
    />
    <Stack.Screen
      component={ItwProximityNfcPresentmentScreen}
      name={ITW_PROXIMITY_ROUTES.NFC_PRESENTMENT}
      options={hiddenHeader}
    />
    <Stack.Screen
      component={ItwProximityClaimsDisclosureScreen}
      name={ITW_PROXIMITY_ROUTES.CLAIMS_DISCLOSURE}
    />
    <Stack.Screen
      component={ItwProximityStoreConsentScreen}
      name={ITW_PROXIMITY_ROUTES.STORE_CONSENT}
      options={hiddenHeader}
    />
    <Stack.Screen
      component={ItwProximitySuccessScreen}
      name={ITW_PROXIMITY_ROUTES.SUCCESS}
      options={hiddenHeader}
    />
    <Stack.Screen
      component={ItwProximityFailureScreen}
      name={ITW_PROXIMITY_ROUTES.FAILURE}
      options={hiddenHeader}
    />
  </Stack.Navigator>
);
