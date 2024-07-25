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
import { ItwIssuanceCredentialFailureScreen } from "../issuance/screens/ItwIssuanceCredentialFailureScreen";
import { ItwIssuanceCredentialPreviewScreen } from "../issuance/screens/ItwIssuanceCredentialPreviewScreen";
import { ItwIssuanceCredentialTrustIssuerScreen } from "../issuance/screens/ItwIssuanceCredentialTrustIssuerScreen";
import { ItwIssuanceEidPreviewScreen } from "../issuance/screens/ItwIssuanceEidPreviewScreen";
import { ItwIssuanceEidRequestScreen } from "../issuance/screens/ItwIssuanceEidRequestScreen";
import { ItwIssuanceEidResultScreen } from "../issuance/screens/ItwIssuanceEidResultScreen";
import { ItwIssuanceEidFailureScreen } from "../issuance/screens/ItwIssuanceEidFailureScreen";
import { ItwCiePinScreen } from "../identification/screens/cie/ItwCiePinScreen";
import { ItwCieCardReaderScreen } from "../identification/screens/cie/ItwCieCardReaderScreen";
import { ItwCieWrongCiePinScreen } from "../identification/screens/cie/ItwCieWrongCiePinScreen";
import { ItwCieWrongCardScreen } from "../identification/screens/cie/ItwCieWrongCardScreen";
import { ItwActivateNfcScreen } from "../identification/screens/cie/ItwActivateNfcScreen";
import { ItwCieUnexpectedErrorScreen } from "../identification/screens/cie/ItwCieUnexpectedErrorScreen";
import { ItwCieExpiredOrInvalidScreen } from "../identification/screens/cie/ItwCieExpiredOrInvalidScreen";
import { WalletCardOnboardingScreen } from "../onboarding/screens/WalletCardOnboardingScreen";
import {
  ItWalletIssuanceMachineProvider,
  ItwCredentialIssuanceMachineContext,
  ItwEidIssuanceMachineContext
} from "../machine/provider";
import ItwPlayground from "../playgrounds/screens/ItwPlayground";
import { ItwPresentationCredentialDetailScreen } from "../presentation/screens/ItwPresentationCredentialDetailScreen";
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
        name={ITW_ROUTES.IDENTIFICATION.IDP_SELECTION}
        component={ItwIdentificationIdpSelectionScreen}
      />
      {/* IDENTIFICATION CIE + PIN */}
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.CIE.PIN_SCREEN}
        component={ItwCiePinScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.CIE.CARD_READER_SCREEN}
        component={ItwCieCardReaderScreen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.IDENTIFICATION.CIE.ACTIVATE_NFC}
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
          name={ITW_ROUTES.IDENTIFICATION.CIE.WRONG_PIN}
          component={ItwCieWrongCiePinScreen}
        />
        <Stack.Screen
          name={ITW_ROUTES.IDENTIFICATION.CIE.WRONG_CARD}
          component={ItwCieWrongCardScreen}
        />
        <Stack.Screen
          name={ITW_ROUTES.IDENTIFICATION.CIE.UNEXPECTED_ERROR}
          component={ItwCieUnexpectedErrorScreen}
        />
        <Stack.Screen
          name={ITW_ROUTES.IDENTIFICATION.CIE.CIE_EXPIRED_SCREEN}
          component={ItwCieExpiredOrInvalidScreen}
        />
      </Stack.Group>
      {/* ISSUANCE */}
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.EID_REQUEST}
        component={ItwIssuanceEidRequestScreen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.EID_PREVIEW}
        component={ItwIssuanceEidPreviewScreen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER}
        component={ItwIssuanceCredentialTrustIssuerScreen}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW}
        component={ItwIssuanceCredentialPreviewScreen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.CREDENTIAL_FAILURE}
        component={ItwIssuanceCredentialFailureScreen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.EID_RESULT}
        component={ItwIssuanceEidResultScreen}
        options={hiddenHeader}
      />
      <Stack.Screen
        name={ITW_ROUTES.ISSUANCE.EID_FAILURE}
        component={ItwIssuanceEidFailureScreen}
        options={{ headerShown: false, gestureEnabled: false }}
        /* gestureEnabled to false prevents going back to the loading screen, just go back to the home screen when swiping back.
         * TODO: [SIW-1375] better retry and go back handling logic for the issuance process
         */
      />
      {/* CREDENTIAL PRESENTATION */}
      <Stack.Screen
        name={ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL}
        component={ItwPresentationCredentialDetailScreen}
        options={hiddenHeader}
      />
      {/* PLAYGROUNDS */}
      <Stack.Screen name={ITW_ROUTES.PLAYGROUNDS} component={ItwPlayground} />
    </Stack.Navigator>
  );
};
