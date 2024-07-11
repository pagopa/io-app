import {
  TransitionPresets,
  createStackNavigator
} from "@react-navigation/stack";
import * as React from "react";
import { Platform } from "react-native";
import { isGestureEnabled } from "../../../utils/navigation";
import { ItwDiscoveryInfoScreen } from "../discovery/screens/ItwDiscoveryInfoScreen";
import { ItwIdentificationIdpSelectionScreen } from "../identification/screens/ItwIdentificationIdpSelectionScreen";
import { ItwIdentificationModeSelectionScreen } from "../identification/screens/ItwIdentificationModeSelectionScreen";
import { ItwIdentificationNfcInstructionsScreen } from "../identification/screens/ItwIdentificationNfcInstructionsScreen";
import { ItwIssuanceCredentialAuthScreen } from "../issuance/screens/ItwIssuanceCredentialAuthScreen";
import { ItwIssuanceCredentialPreviewScreen } from "../issuance/screens/ItwIssuanceCredentialPreviewScreen";
import { ItwIssuanceEidPreviewScreen } from "../issuance/screens/ItwIssuanceEidPreviewScreen";
import { ItwIssuanceEidResultScreen } from "../issuance/screens/ItwIssuanceEidResultScreen";
import {
  ItWalletIssuanceMachineProvider,
  ItwCredentialIssuanceMachineContext,
  ItwEidIssuanceMachineContext
} from "../machine/provider";
import { ItwPresentationEidDetailScreen } from "../presentation/screens/ItwPresentationEidDetailScreen";
import { ItwCiePinScreen } from "../identification/screens/cie/ItwCiePinScreen";
import { ItwCieConsentDataUsageScreen } from "../identification/screens/cie/ItwCieConsentDataUsageScreen";
import { ItwCieCardReaderScreenWrapper } from "../identification/screens/cie/ItwCieCardReaderScreenWrapper";
import { ItwCieWrongCiePinScreen } from "../identification/screens/cie/ItwCieWrongCiePinScreen";
import { ItwCieWrongCardScreen } from "../identification/screens/cie/ItwCieWrongCardScreen";
import { ItwActivateNfcScreen } from "../identification/screens/cie/ItwActivateNfcScreen";
import { ItwCieUnexpectedErrorScreen } from "../identification/screens/cie/ItwCieUnexpectedErrorScreen";
import { ItwCieExpiredOrInvalidScreen } from "../identification/screens/cie/ItwCieExpiredOrInvalidScreen";
import ItwPlayground from "../playgrounds/screens/ItwPlayground";
import { ItwParamsList } from "./ItwParamsList";
import { ITW_ROUTES } from "./routes";

const Stack = createStackNavigator<ItwParamsList>();

const hiddenHeader = { headerShown: false };

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

      {/* ISSUANCE CIE PID */}
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.EID_CIE.PIN_SCREEN}
        component={ItwCiePinScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.EID_CIE.CARD_READER_SCREEN}
        component={ItwCieCardReaderScreenWrapper}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.EID_CIE.CONSENT_DATA_USAGE}
        component={ItwCieConsentDataUsageScreen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.EID_CIE.ACTIVATE_NFC}
        component={ItwActivateNfcScreen}
      />
      <Stack.Group
        screenOptions={{
          gestureEnabled: false,
          headerShown: false,
          ...Platform.select({
            ios: TransitionPresets.ModalSlideFromBottomIOS,
            default: undefined
          })
        }}
      >
        <Stack.Screen
          name={ITW_ROUTES.ISSUANCE.EID_CIE.WRONG_PIN}
          component={ItwCieWrongCiePinScreen}
        />
        <Stack.Screen
          name={ITW_ROUTES.ISSUANCE.EID_CIE.WRONG_CARD}
          component={ItwCieWrongCardScreen}
        />
        <Stack.Screen
          name={ITW_ROUTES.ISSUANCE.EID_CIE.UNEXPECTED_ERROR}
          component={ItwCieUnexpectedErrorScreen}
        />
        <Stack.Screen
          name={ITW_ROUTES.ISSUANCE.EID_CIE.CIE_EXPIRED_SCREEN}
          component={ItwCieExpiredOrInvalidScreen}
        />
      </Stack.Group>
      {/* ISSUANCE */}
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.EID_PREVIEW}
        component={ItwIssuanceEidPreviewScreen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.CREDENTIAL_AUTH}
        component={ItwIssuanceCredentialAuthScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW}
        component={ItwIssuanceCredentialPreviewScreen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.EID_RESULT}
        component={ItwIssuanceEidResultScreen}
        options={hiddenHeader}
      />
      {/* CREDENTIAL PRESENTATION */}
      <Stack.Screen
        name={ITW_ROUTES.PRESENTATION.EID_DETAIL}
        component={ItwPresentationEidDetailScreen}
        options={hiddenHeader}
      />
      {/* PLAYGROUNDS */}
      <Stack.Screen name={ITW_ROUTES.PLAYGROUNDS} component={ItwPlayground} />
    </Stack.Navigator>
  );
};
