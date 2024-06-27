import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { isGestureEnabled } from "../../../utils/navigation";
import { ItwDiscoveryInfoScreen } from "../discovery/screens/ItwDiscoveryInfoScreen";
import { ItwIdentificationIdpSelectionScreen } from "../identification/screens/ItwIdentificationIdpSelectionScreen";
import { ItwIdentificationModeSelectionScreen } from "../identification/screens/ItwIdentificationModeSelectionScreen";
import { ItwIdentificationNfcInstructionsScreen } from "../identification/screens/ItwIdentificationNfcInstructionsScreen";
import { ItwIssuanceCredentialAuthScreen } from "../issuance/screens/ItwIssuanceCredentialAuthScreen";
import { ItwIssuanceCredentialPreviewScreen } from "../issuance/screens/ItwIssuanceCredentialPreviewScreen";
import { ItwIssuanceEidPreviewScreen } from "../issuance/screens/ItwIssuanceEidPreviewScreen";
import { ItwIssuanceEidResultScreen } from "../issuance/screens/ItwIssuanceEidResultScreen";
import { ItwPresentationEidDetailScreen } from "../presentation/screens/ItwPresentationEidDetailScreen";
import { ItwCiePinScreen } from "../identification/screens/cie/ItwCiePinScreen";
import { ItwCieConsentDataUsageScreen } from "../identification/screens/cie/ItwCieConsentDataUsageScreen";
import { ItwCieCardReaderScreenWrapper } from "../identification/screens/cie/ItwCieCardReaderScreenWrapper";
import { ItwCieWrongCiePinScreen } from "../identification/screens/cie/ItwCieWrongCiePinScreen";
import { ItwCieWrongCardScreen } from "../identification/screens/cie/ItwCieWrongCardScreen";
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
    {/* ISSUANCE CIE PID */}
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.EID_CIE.PIN_SCREEN}
      component={ItwCiePinScreen}
      options={{ headerShown: true }}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.EID_CIE.CARD_READER_SCREEN}
      component={ItwCieCardReaderScreenWrapper}
    />

    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.EID_CIE.CONSENT_DATA_USAGE}
      component={ItwCieConsentDataUsageScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.EID_CIE.WRONG_PIN}
      component={ItwCieWrongCiePinScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.EID_CIE.WRONG_CARD}
      component={ItwCieWrongCardScreen}
    />
    {/* ISSUANCE */}
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
      name={ITW_ROUTES.ISSUANCE.RESULT}
      component={ItwIssuanceEidResultScreen}
      options={{ headerShown: false }}
    />

    {/* CREDENTIAL PRESENTATION */}
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.EID_DETAIL}
      component={ItwPresentationEidDetailScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);
