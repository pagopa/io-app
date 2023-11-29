import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../utils/navigation";
import ItwCiePinScreen from "../screens/issuing/pid/cie/ItwCiePinScreen";
import ItwCieCardReaderScreen from "../screens/issuing/pid/cie/ItwCieCardReaderScreen";
import ItwCieConsentDataUsageScreen from "../screens/issuing/pid/cie/ItwCieConsentDataUsageScreen";
import ItwCieExpiredOrInvalidScreen from "../screens/issuing/pid/cie/ItwCieExpiredOrInvalidScreen";
import ItwCieWrongPinScreen from "../screens/issuing/pid/cie/ItwCieWrongPinScreen";
import ItwPidInfoScreen from "../screens/issuing/pid/ItwPidInfoScreen";
import ItwPidAuthInfoScreen from "../screens/issuing/pid/ItwPidAuthInfoScreen";
import ItwPidPreviewScreen from "../screens/issuing/pid/cie/ItwPidPreviewScreen";
import ItwPidAddingScreen from "../screens/issuing/pid/ItwPidAddingScreen";
import ItwPrPidDetails from "../screens/presentation/ItwPrPidDetails";
import ItwPidRequestScreen from "../screens/issuing/pid/ItwPidRequestScreen";
import ItwPrPidChecksScreen from "../screens/presentation/remote/pid/ItwPrPidChecksScreen";
import ItwPrPidResultScreen from "../screens/presentation/remote/pid/ItwPrPidResultScreen";
import ItwPidAuthScreen from "../screens/issuing/pid/ItwPidAuthScreen";
import ItwGenericNotAvailableScreen from "../screens/generic/ItwGenericNotAvailableScreen";
import ItwCredentialPreviewScreen from "../screens/issuing/credential/ItwCredentialPreviewScreen";
import ItwCredentialAuthScreen from "../screens/issuing/credential/ItwCredentialAuthScreen";
import ItwPrCredentialChecksScreen from "../screens/presentation/remote/credential/ItwPrCredentialChecksScreen";
import ItwPrCredentialDataScreen from "../screens/presentation/remote/credential/ItwPrCredentialDataScreen";
import ItwPrCredentialResultScreen from "../screens/presentation/remote/credential/ItwPrCredentialResultScreen";
import ItwCredentialsChecksScreen from "../screens/issuing/credential/ItwCredentialChecksScreen";
import ItwCredentialCatalogScreen from "../screens/issuing/credential/ItwCredentialCatalogScreen";
import ItwPrCredentialDetailsScreen from "../screens/presentation/ItwPrCredentialDetails";
import ItwPrPidDataScreen from "../screens/presentation/remote/pid/ItwPrPidDataScreen";
import ItwPrProximityQrCodeScreen from "../screens/presentation/ItwPrProximityQrCodeScreen";
import { ItwParamsList } from "./ItwParamsList";
import { ITW_ROUTES } from "./ItwRoutes";

const Stack = createStackNavigator<ItwParamsList>();

export const ItwStackNavigator = () => (
  <Stack.Navigator
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    {/* ISSUING PID CIE */}
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.CIE.EXPIRED_SCREEN}
      component={ItwCieExpiredOrInvalidScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.CIE.PIN_SCREEN}
      component={ItwCiePinScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.CIE.CARD_READER_SCREEN}
      component={ItwCieCardReaderScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.CIE.CONSENT_DATA_USAGE}
      component={ItwCieConsentDataUsageScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.CIE.WRONG_PIN_SCREEN}
      component={ItwCieWrongPinScreen}
    />

    {/* ISSUING PID */}
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.INFO}
      component={ItwPidInfoScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.AUTH}
      component={ItwPidAuthScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.AUTH_INFO}
      component={ItwPidAuthInfoScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.REQUEST}
      component={ItwPidRequestScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.PREVIEW}
      component={ItwPidPreviewScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.ADDING}
      component={ItwPidAddingScreen}
    />

    {/* ISSUING CREDENTIAL */}
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.CREDENTIAL.CATALOG}
      component={ItwCredentialCatalogScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.CREDENTIAL.CHECKS}
      component={ItwCredentialsChecksScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.CREDENTIAL.AUTH}
      component={ItwCredentialAuthScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.CREDENTIAL.PREVIEW}
      component={ItwCredentialPreviewScreen}
    />

    {/* PRESENTATION PID */}
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.PID.DETAILS}
      component={ItwPrPidDetails}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.PID.REMOTE.CHECKS}
      component={ItwPrPidChecksScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.PID.REMOTE.DATA}
      component={ItwPrPidDataScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.PID.REMOTE.RESULT}
      component={ItwPrPidResultScreen}
    />

    {/* CREDENTIAL PRESENTATION */}
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CREDENTIAL.DETAILS}
      component={ItwPrCredentialDetailsScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.CHECKS}
      component={ItwPrCredentialChecksScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.DATA}
      component={ItwPrCredentialDataScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.RESULT}
      component={ItwPrCredentialResultScreen}
    />

    {/* PRESENTATION PROXIMITY */}
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.PROXIMITY.QRCODE}
      component={ItwPrProximityQrCodeScreen}
    />

    {/* GENERIC */}
    <Stack.Screen
      name={ITW_ROUTES.GENERIC.NOT_AVAILABLE}
      component={ItwGenericNotAvailableScreen}
    />
  </Stack.Navigator>
);
