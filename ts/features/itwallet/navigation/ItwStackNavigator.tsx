import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { isGestureEnabled } from "../../../utils/navigation";
import { ItwDiscoveryInfoScreen } from "../discovery/screens/ItwDiscoveryInfoScreen";
import { ItwIdentificationIdpSelectionScreen } from "../identification/screens/ItwIdentificationIdpSelectionScreen";
import { ItwIdentificationModeSelectionScreen } from "../identification/screens/ItwIdentificationModeSelectionScreen";
import { ItwIdentificationNfcInstructionsScreen } from "../identification/screens/ItwIdentificationNfcInstructionsScreen";
import { ItwIssuanceEidPreviewScreen } from "../issuance/screens/ItwIssuanceEidPreviewScreen";
import {
  ItWalletIssuanceMachineContext,
  ItWalletIssuanceMachineProvider
} from "../machine/provider";
import { ItwParamsList } from "./ItwParamsList";
import { ITW_ROUTES } from "./routes";

const Stack = createStackNavigator<ItwParamsList>();

export const ItwStackNavigator = () => (
  <ItWalletIssuanceMachineProvider>
    <InnerNavigator />
  </ItWalletIssuanceMachineProvider>
);

const InnerNavigator = () => {
  const machineRef = ItWalletIssuanceMachineContext.useActorRef();

  return (
    <Stack.Navigator
      initialRouteName={ITW_ROUTES.DISCOVERY.INFO}
      screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
      screenListeners={{
        beforeRemove: () => machineRef.send({ type: "back" })
      }}
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
    </Stack.Navigator>
  );
};
