import {
  createStackNavigator,
  TransitionPresets
} from "@react-navigation/stack";

import { isGestureEnabled } from "../../../../../utils/navigation";
import {
  ItwProximityMachineContext,
  ItwProximityMachineProvider
} from "../machine/provider";
import { ItwActivateBluetoothScreen } from "../screens/ItwActivateBluetoothScreen";
import { ItwGrantPermissionsScreen } from "../screens/ItwGrantPermissionsScreen";
import { ItwProximityClaimsDisclosureScreen } from "../screens/ItwProximityClaimsDisclosureScreen";
import { ItwProximityFailureScreen } from "../screens/ItwProximityFailureScreen";
import { ItwProximityQrCodeScreen } from "../screens/ItwProximityQrCodeScreen.tsx";
import { ItwProximitySendDocumentsResponseScreen } from "../screens/ItwProximitySendDocumentsResponseScreen";
import { ItwProximityParamsList } from "./ItwProximityParamsList";
import { ITW_PROXIMITY_ROUTES } from "./routes";

const Stack = createStackNavigator<ItwProximityParamsList>();

const hiddenHeader = { headerShown: false };

export const ItwProximityStackNavigator = () => (
  <ItwProximityMachineProvider>
    <InnerNavigator />
  </ItwProximityMachineProvider>
);

const InnerNavigator = () => {
  const proximityMachineRef = ItwProximityMachineContext.useActorRef();

  return (
    <Stack.Navigator
      initialRouteName={ITW_PROXIMITY_ROUTES.QR_CODE}
      screenListeners={{
        beforeRemove: () => {
          proximityMachineRef.send({ type: "back" });
        }
      }}
      screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
    >
      <Stack.Screen
        component={ItwProximityQrCodeScreen}
        name={ITW_PROXIMITY_ROUTES.QR_CODE}
        options={TransitionPresets.ModalSlideFromBottomIOS}
      />
      <Stack.Screen
        component={ItwGrantPermissionsScreen}
        name={ITW_PROXIMITY_ROUTES.DEVICE_PERMISSIONS}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={ItwActivateBluetoothScreen}
        name={ITW_PROXIMITY_ROUTES.BLUETOOTH_ACTIVATION}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={ItwProximityClaimsDisclosureScreen}
        name={ITW_PROXIMITY_ROUTES.CLAIMS_DISCLOSURE}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={ItwProximitySendDocumentsResponseScreen}
        name={ITW_PROXIMITY_ROUTES.SEND_DOCUMENTS_RESPONSE}
        options={hiddenHeader}
      />
      <Stack.Screen
        component={ItwProximityFailureScreen}
        name={ITW_PROXIMITY_ROUTES.FAILURE}
        options={hiddenHeader}
      />
    </Stack.Navigator>
  );
};
