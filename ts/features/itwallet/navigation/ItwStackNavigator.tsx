import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { isGestureEnabled } from "../../../utils/navigation";
import { ItwDiscoveryInfoScreen } from "../discovery/screens/ItwDiscoveryInfoScreen";
import { ItwIdentificationIdpSelectionScreen } from "../identification/screens/ItwIdentificationIdpSelectionScreen";
import { ItwIdentificationModeSelectionScreen } from "../identification/screens/ItwIdentificationModeSelectionScreen";
import { ItwIdentificationNfcInstructionsScreen } from "../identification/screens/ItwIdentificationNfcInstructionsScreen";
import { ItwIssuanceCredentialAuthScreen } from "../issuance/screens/ItwIssuanceCredentialAuthScreen";
import { ItwIssuanceCredentialPreviewScreen } from "../issuance/screens/ItwIssuanceCredentialPreviewScreen";
import { ItwIssuanceEidRequestScreen } from "../issuance/screens/ItwIssuanceEidRequestScreen";
import { ItwIssuanceEidPreviewScreen } from "../issuance/screens/ItwIssuanceEidPreviewScreen";
import { ItwIssuanceEidResultScreen } from "../issuance/screens/ItwIssuanceEidResultScreen";
import { ItwIssuanceFailureScreen } from "../issuance/screens/ItwIssuanceFailureScreen";
import {
  ItWalletIssuanceMachineProvider,
  ItwCredentialIssuanceMachineContext,
  ItwEidIssuanceMachineContext
} from "../machine/provider";
import { WalletCardOnboardingScreen } from "../onboarding/screens/WalletCardOnboardingScreen";
import ItwPlayground from "../playgrounds/screens/ItwPlayground";
import { ItwPresentationEidDetailScreen } from "../presentation/screens/ItwPresentationEidDetailScreen";
import { ItwParamsList } from "./ItwParamsList";
import { ITW_ROUTES } from "./routes";

const Stack = createStackNavigator<ItwParamsList>();

export const ItwStackNavigator = () => (
  <ItWalletIssuanceMachineProvider>
    <InnerNavigator />
  </ItWalletIssuanceMachineProvider>
);

const InnerNavigator = () => {
  const eidIssuanceMachineRef = ItwEidIssuanceMachineContext.useActorRef();
  const credentialIssuanceMachineRef =
    ItwCredentialIssuanceMachineContext.useActorRef();

  return (
    <Stack.Navigator
      initialRouteName={ITW_ROUTES.DISCOVERY.INFO}
      screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
      screenListeners={{
        beforeRemove: () => {
          // Read more on https://reactnavigation.org/docs/preventing-going-back/
          // Whenever we have a back navigation action we send a "back" event to the machine.
          // Since the back event is accepted only by specific states, we can safely send a back event to each machine
          eidIssuanceMachineRef.send({ type: "back" });
          credentialIssuanceMachineRef.send({ type: "back" });
        }
      }}
    >
      <Stack.Screen
        name={ITW_ROUTES.ONBOARDING}
        component={WalletCardOnboardingScreen}
      />
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
        name={ITW_ROUTES.ISSUANCE.EID_REQUEST}
        component={ItwIssuanceEidRequestScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.EID_PREVIEW}
        component={ItwIssuanceEidPreviewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.CREDENTIAL_AUTH}
        component={ItwIssuanceCredentialAuthScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW}
        component={ItwIssuanceCredentialPreviewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.EID_RESULT}
        component={ItwIssuanceEidResultScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.EID_FAILURE}
        component={ItwIssuanceFailureScreen}
        options={{ headerShown: false }}
      />
      {/* CREDENTIAL PRESENTATION */}
      <Stack.Screen
        name={ITW_ROUTES.PRESENTATION.EID_DETAIL}
        component={ItwPresentationEidDetailScreen}
        options={{ headerShown: false }}
      />
      {/* PLAYGROUNDS */}
      <Stack.Screen name={ITW_ROUTES.PLAYGROUNDS} component={ItwPlayground} />
    </Stack.Navigator>
  );
};
