import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../utils/navigation";
import ItwCiePinScreen from "../screens/issuing/pid/cie/ItwCiePinScreen";
import ItwCieCardReaderScreen from "../screens/issuing/pid/cie/ItwCieCardReaderScreen";
import ItwCieConsentDataUsageScreen from "../screens/issuing/pid/cie/ItwCieConsentDataUsageScreen";
import ItwCieExpiredOrInvalidScreen from "../screens/issuing/pid/cie/ItwCieExpiredOrInvalidScreen";
import ItwCieWrongPinScreen from "../screens/issuing/pid/cie/ItwCieWrongPinScreen";
import ItwIssuingPidInfoScreen from "../screens/issuing/pid/ItwIssuingPidInfoScreen";
import ItwIssuingPidAuthInfoScreen from "../screens/issuing/pid/ItwIssuingPidAuthInfoScreen";
import ItwPidPreviewScreen from "../screens/issuing/pid/ItwPidPreviewScreen";
import ItwIssuingPidAddingScreen from "../screens/issuing/pid/ItwIssuingPidAddingScreen";
import ItwPrPidDetails from "../screens/presentation/ItwPrPidDetails";
import ItwIssuingPidRequestScreen from "../screens/issuing/pid/ItwIssuingPidRequestScreen";
import ItwPrRemotePidChecksScreen from "../screens/presentation/remote/pid/ItwPrRemotePidChecksScreen";
import ItwPrRemotePidResultScreen from "../screens/presentation/remote/pid/ItwPrRemotePidResultScreen";
import ItwIssuingPidAuthScreen from "../screens/issuing/pid/ItwIssuingPidAuthScreen";
import ItwGenericNotAvailableScreen from "../screens/generic/ItwGenericNotAvailableScreen";
import ItwIssuingCredentialPreviewScreen from "../screens/issuing/credential/ItwIssuingCredentialPreviewScreen";
import ItwIssuingCredentialAuthScreen from "../screens/issuing/credential/ItwIssuingCredentialAuthScreen";
import ItwPrRemoteCredentialChecksScreen from "../screens/presentation/remote/credential/ItwPrRemoteCredentialChecksScreen";
import ItwPrRemoteCredentialDataScreen from "../screens/presentation/remote/credential/ItwPrRemoteCredentialDataScreen";
import ItwPrRemoteCredentialResultScreen from "../screens/presentation/remote/credential/ItwPrRemoteCredentialResultScreen";
import ItwIssuingCredentialsChecksScreen from "../screens/issuing/credential/ItwIssuingCredentialChecksScreen";
import ItwIssuingCredentialCatalogScreen from "../screens/issuing/credential/ItwIssuingCredentialCatalogScreen";
import ItwPrCredentialDetailsScreen from "../screens/presentation/ItwPrCredentialDetails";
import ItwPrRemotePidDataScreen from "../screens/presentation/remote/pid/ItwPrRemotePidDataScreen";
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
      component={ItwIssuingPidInfoScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.AUTH}
      component={ItwIssuingPidAuthScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.AUTH_INFO}
      component={ItwIssuingPidAuthInfoScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.REQUEST}
      component={ItwIssuingPidRequestScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.PREVIEW}
      component={ItwPidPreviewScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.ADDING}
      component={ItwIssuingPidAddingScreen}
    />

    {/* ISSUING CREDENTIAL */}
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.CREDENTIAL.CATALOG}
      component={ItwIssuingCredentialCatalogScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.CREDENTIAL.CHECKS}
      component={ItwIssuingCredentialsChecksScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.CREDENTIAL.AUTH}
      component={ItwIssuingCredentialAuthScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.CREDENTIAL.PREVIEW}
      component={ItwIssuingCredentialPreviewScreen}
    />

    {/* PRESENTATION PID */}
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.PID.DETAILS}
      component={ItwPrPidDetails}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.PID.REMOTE.CHECKS}
      component={ItwPrRemotePidChecksScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.PID.REMOTE.DATA}
      component={ItwPrRemotePidDataScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.PID.REMOTE.RESULT}
      component={ItwPrRemotePidResultScreen}
    />

    {/* CREDENTIAL PRESENTATION */}
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CREDENTIAL.DETAILS}
      component={ItwPrCredentialDetailsScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.CHECKS}
      component={ItwPrRemoteCredentialChecksScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.DATA}
      component={ItwPrRemoteCredentialDataScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.RESULT}
      component={ItwPrRemoteCredentialResultScreen}
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
