import {
  createStackNavigator,
  TransitionPresets
} from "@react-navigation/stack";
import { isGestureEnabled } from "../../../../../utils/navigation";
import {
  ItwProximityMachineContext,
  ItwProximityMachineProvider
} from "../machine/provider";
import { ItwBluetoothActivationScreen } from "../screens/ItwBluetoothActivationScreen.tsx";
import { ItwBluetoothPermissionsScreen } from "../screens/ItwBluetoothPermissionsScreen.tsx";
import { ItwNfcActivationScreen } from "../screens/ItwNfcActivationScreen.tsx";
import { ItwProximityClaimsDisclosureScreen } from "../screens/ItwProximityClaimsDisclosureScreen";
import { ItwProximityFailureScreen } from "../screens/ItwProximityFailureScreen";
import { ItwProximityNfcPresentmentScreen } from "../screens/ItwProximityNfcPresentmentScreen.tsx";
import { ItwProximityQrCodePresentmentScreen } from "../screens/ItwProximityQrCodePresentmentScreen.tsx";
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
      initialRouteName={ITW_PROXIMITY_ROUTES.QR_CODE_PRESENTMENT}
      screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
      screenListeners={{
        beforeRemove: () => {
          proximityMachineRef.send({ type: "back" });
        }
      }}
    >
      <Stack.Screen
        name={ITW_PROXIMITY_ROUTES.QR_CODE_PRESENTMENT}
        component={ItwProximityQrCodePresentmentScreen}
        options={TransitionPresets.ModalSlideFromBottomIOS}
      />
      <Stack.Screen
        name={ITW_PROXIMITY_ROUTES.NFC_PRESENTMENT}
        component={ItwProximityNfcPresentmentScreen}
        options={TransitionPresets.ModalSlideFromBottomIOS}
      />
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
        name={ITW_PROXIMITY_ROUTES.CLAIMS_DISCLOSURE}
        component={ItwProximityClaimsDisclosureScreen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_PROXIMITY_ROUTES.SEND_DOCUMENTS_RESPONSE}
        component={ItwProximitySendDocumentsResponseScreen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_PROXIMITY_ROUTES.FAILURE}
        component={ItwProximityFailureScreen}
        options={hiddenHeader}
      />
    </Stack.Navigator>
  );
};
