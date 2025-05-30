import { createStackNavigator } from "@react-navigation/stack";

import { isGestureEnabled } from "../../../../utils/navigation.ts";
import { ItwL3CredentialDetailScreen } from "../screens/ItwL3CredentialDetailScreen.tsx";
import { ItWalletIssuanceMachineProvider } from "../../machine/provider.tsx";
import ItwPlayground from "../screens/ItwPlayground.tsx";
import { ItwPlaygroundParamsList } from "./ItwPlaygroundParamsList.ts";
import { ITW_PLAYGROUND_ROUTES } from "./routes.ts";

const Stack = createStackNavigator<ItwPlaygroundParamsList>();

const hiddenHeader = { headerShown: false };

export const ItwPlaygroundStackNavigator = () => (
  <ItWalletIssuanceMachineProvider>
    <InnerNavigator />
  </ItWalletIssuanceMachineProvider>
);

const InnerNavigator = () => (
  <Stack.Navigator
    initialRouteName={ITW_PLAYGROUND_ROUTES.MAIN}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    <Stack.Screen
      name={ITW_PLAYGROUND_ROUTES.LANDING}
      component={ItwPlayground}
      options={hiddenHeader}
    />
    <Stack.Screen
      name={ITW_PLAYGROUND_ROUTES.CREDENTIAL_DETAIL}
      component={ItwL3CredentialDetailScreen}
      options={hiddenHeader}
    />
  </Stack.Navigator>
);
