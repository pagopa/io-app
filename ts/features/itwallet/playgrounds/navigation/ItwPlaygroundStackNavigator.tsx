import { createStackNavigator } from "@react-navigation/stack";

import { isGestureEnabled } from "../../../../utils/navigation.ts";
import { ItwL3CredentialDetailScreen } from "../screens/ItwL3CredentialDetailScreen.tsx";
import { ItWalletIssuanceMachineProvider } from "../../machine/provider.tsx";
import ItwPlayground from "../screens/ItwPlayground.tsx";
import { ItwGrantPermissionsScreen } from "../../presentation/proximity/screens/ItwGrantPermissionsScreen.tsx";
import { ItwActivateBluetoothScreen } from "../../presentation/proximity/screens/ItwActivateBluetoothScreen.tsx";
import { ItwPlaygroundProximityMachineProvider } from "../machine/proximity/proximity.tsx";
import { ItwProximityMachineContext } from "../../presentation/proximity/machine/provider.tsx";
import { ItwPlaygroundParamsList } from "./ItwPlaygroundParamsList.ts";
import { ITW_PLAYGROUND_ROUTES } from "./routes.ts";

const Stack = createStackNavigator<ItwPlaygroundParamsList>();

export const ItwPlaygroundStackNavigator = () => (
  <ItWalletIssuanceMachineProvider>
    <ItwPlaygroundProximityMachineProvider>
      <InnerNavigator />
    </ItwPlaygroundProximityMachineProvider>
  </ItWalletIssuanceMachineProvider>
);

const InnerNavigator = () => {
  const itwProximityMachineRef = ItwProximityMachineContext.useActorRef();

  return (
    <Stack.Navigator
      initialRouteName={ITW_PLAYGROUND_ROUTES.MAIN}
      screenOptions={{
        gestureEnabled: isGestureEnabled,
        headerShown: false
      }}
      screenListeners={{
        beforeRemove: () => {
          // Read more on https://reactnavigation.org/docs/preventing-going-back/
          // Whenever we have a back navigation action we send a "back" event to the machine.
          // Since the back event is accepted only by specific states, we can safely send a back event to each machine
          itwProximityMachineRef.send({ type: "back" });
        }
      }}
    >
      <Stack.Screen
        name={ITW_PLAYGROUND_ROUTES.LANDING}
        component={ItwPlayground}
      />
      <Stack.Screen
        name={ITW_PLAYGROUND_ROUTES.CREDENTIAL_DETAIL}
        component={ItwL3CredentialDetailScreen}
      />
      <Stack.Screen
        name={ITW_PLAYGROUND_ROUTES.DEVICE_PERMISSIONS}
        component={ItwGrantPermissionsScreen}
      />
      <Stack.Screen
        name={ITW_PLAYGROUND_ROUTES.BLUETOOTH_ACTIVATION}
        component={ItwActivateBluetoothScreen}
      />
    </Stack.Navigator>
  );
};
