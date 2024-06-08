import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { isGestureEnabled } from "../../../utils/navigation";
import { ItwDiscoveryInfoScreen } from "../discovery/screens/ItwDiscoveryInfoScreen";
import { ItwIdentificationIdpSelectionScreen } from "../identification/screens/ItwIdentificationIdpSelectionScreen";
import { ItwIdentificationModeSelectionScreen } from "../identification/screens/ItwIdentificationModeSelectionScreen";
import { ItwIdentificationNfcInstructionsScreen } from "../identification/screens/ItwIdentificationNfcInstructionsScreen";
import { ItwIssuanceEidPreviewScreen } from "../issuance/screens/ItwIssuanceEidPreviewScreen";
import { ItwIssuanceEidResultScreen } from "../issuance/screens/ItwIssuanceEidResultScreen";
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
      component={ItwIdentificationNfcInstructionsScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.IDENTIFICATION.IDP_SELECTION}
      component={ItwIdentificationIdpSelectionScreen}
    />
    {/* ISSUANCE */}
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.EID_PREVIEW}
      component={ItwIssuanceEidPreviewScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.RESULT}
      component={ItwIssuanceEidResultScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);
