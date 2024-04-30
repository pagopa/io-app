import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { isGestureEnabled } from "../../../utils/navigation";
import { ItwAuthModeSelectionScreen } from "../authentication/screens/ItwAuthModeSelectionScreen";
import { ItwAuthNfcInstructionsScreen } from "../authentication/screens/ItwAuthNfcInstructionsScreen";
import { ItwDiscoveryInfoScreen } from "../discovery/screens/ItwDiscoveryInfoScreen";
import { ItwParamsList } from "./ItwParamsList";
import { ITW_ROUTES } from "./routes";

const Stack = createStackNavigator<ItwParamsList>();

export const ItwStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={ITW_ROUTES.DISCOVERY.INFO}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
  >
    {/* DISCOVERY */}
    <Stack.Screen
      name={ITW_ROUTES.DISCOVERY.INFO}
      component={ItwDiscoveryInfoScreen}
    />
    {/* AUTHENTICATION */}
    <Stack.Screen
      name={ITW_ROUTES.AUTH.MODE_SELECTION}
      component={ItwAuthModeSelectionScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.AUTH.NFC_INSTRUCTIONS}
      component={ItwAuthNfcInstructionsScreen}
    />
  </Stack.Navigator>
);
