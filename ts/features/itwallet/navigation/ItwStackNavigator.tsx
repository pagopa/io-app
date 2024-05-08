import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { isGestureEnabled } from "../../../utils/navigation";
import { ItwIdentificationModeSelectionScreen } from "../identification/screens/ItwIdentificationModeSelectionScreen";
import { ItwDiscoveryInfoScreen } from "../discovery/screens/ItwDiscoveryInfoScreen";
import { ItwAuthNfcInstructionsScreen } from "../authentication/screens/ItwAuthNfcInstructionsScreen";
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
    {/* IDENTIFICATION */}
    <Stack.Screen
      name={ITW_ROUTES.IDENTIFICATION.MODE_SELECTION}
      component={ItwIdentificationModeSelectionScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.IDENTIFICATION.NFC_INSTRUCTIONS}
      component={ItwAuthNfcInstructionsScreen}
    />
  </Stack.Navigator>
);
