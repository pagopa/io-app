import {
  createStackNavigator,
  TransitionPresets
} from "@react-navigation/stack";
import { isGestureEnabled } from "../../../../../utils/navigation";
import { ItwPresentationQrCodeScreen } from "../../qrcode/screens/ItwPresentationQrCodeScreen";
import {
  ItwProximityMachineContext,
  ItwProximityMachineProvider
} from "../machine/provider";
import { ItwActivateBluetoothScreen } from "../screens/ItwActivateBluetoothScreen";
import { ItwGrantPermissionsScreen } from "../screens/ItwGrantPermissionsScreen";
import { ItwProximityClaimsDisclosureScreen } from "../screens/ItwProximityClaimsDisclosureScreen";
import { ItwProximityFailureScreen } from "../screens/ItwProximityFailureScreen";
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
      screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
      screenListeners={{
        beforeRemove: () => {
          proximityMachineRef.send({ type: "back" });
        }
      }}
    >
      <Stack.Screen
        name={ITW_PROXIMITY_ROUTES.QR_CODE}
        component={ItwPresentationQrCodeScreen}
        options={TransitionPresets.ModalSlideFromBottomIOS}
      />
      <Stack.Screen
        name={ITW_PROXIMITY_ROUTES.DEVICE_PERMISSIONS}
        component={ItwGrantPermissionsScreen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_PROXIMITY_ROUTES.BLUETOOTH_ACTIVATION}
        component={ItwActivateBluetoothScreen}
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
