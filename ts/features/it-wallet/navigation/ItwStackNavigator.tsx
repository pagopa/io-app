import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../utils/navigation";
import ItwCiePinScreen from "../screens/issuance/pid/cie/ItwCiePinScreen";
import ItwCieCardReaderScreen from "../screens/issuance/pid/cie/ItwCieCardReaderScreen";
import ItwCieConsentDataUsageScreen from "../screens/issuance/pid/cie/ItwCieConsentDataUsageScreen";
import ItwCieExpiredOrInvalidScreen from "../screens/issuance/pid/cie/ItwCieExpiredOrInvalidScreen";
import ItwCieWrongPinScreen from "../screens/issuance/pid/cie/ItwCieWrongPinScreen";
import ItwIssuancePidInfoScreen from "../screens/issuance/pid/ItwIssuancePidInfoScreen";
import ItwIssuingPidAuthInfoScreen from "../screens/issuance/pid/ItwIssuancePidAuthInfoScreen";
import ItwIssuancePidPreviewScreen from "../screens/issuance/pid/ItwIssuancePidPreviewScreen";
import ItwIssuingPidStoreScreen from "../screens/issuance/pid/ItwIssuancePidStoreScreen";
import ItwPrPidDetails from "../screens/presentation/ItwPrPidDetails";
import ItwIssuancePidRequestScreen from "../screens/issuance/pid/ItwIssuancePidRequestScreen";
import ItwPrRemotePidChecksScreen from "../screens/presentation/remote/pid/ItwPrRemotePidChecksScreen";
import ItwPrRemotePidResultScreen from "../screens/presentation/remote/pid/ItwPrRemotePidResultScreen";
import ItwIssuancePidAuthScreen from "../screens/issuance/pid/ItwIssuancePidAuthScreen";
import ItwGenericNotAvailableScreen from "../screens/generic/ItwGenericNotAvailableScreen";
import ItwIssuanceCredentialPreviewScreen from "../screens/issuance/credential/ItwIssuanceCredentialPreviewScreen";
import ItwIssuanceCredentialAuthScreen from "../screens/issuance/credential/ItwIssuanceCredentialAuthScreen";
import ItwPrRemoteCredentialDataScreen from "../screens/presentation/remote/credential/ItwPrRemoteCredentialDataScreen";
import ItwPrRemoteCredentialResultScreen from "../screens/presentation/remote/credential/ItwPrRemoteCredentialResultScreen";
import ItwIssuanceCredentialChecksScreen from "../screens/issuance/credential/ItwIssuanceCredentialChecksScreen";
import ItwIssuanceCredentialCatalogScreen from "../screens/issuance/credential/ItwIssuanceCredentialCatalogScreen";
import ItwPrCredentialDetailsScreen from "../screens/presentation/ItwPrCredentialDetails";
import ItwPrRemotePidDataScreen from "../screens/presentation/remote/pid/ItwPrRemotePidDataScreen";
import ItwPrProximityQrCodeScreen from "../screens/presentation/ItwPrProximityQrCodeScreen";
import ItwPrRemoteCredentialInitScreen from "../screens/presentation/remote/credential/ItwPrRemoteCredentialChecksScreen";
import { ItwParamsList } from "./ItwParamsList";
import { ITW_ROUTES } from "./ItwRoutes";

const Stack = createStackNavigator<ItwParamsList>();

export const ItwStackNavigator = () => (
  <Stack.Navigator
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    {/* ISSUANCE PID CIE */}
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.PID.CIE.EXPIRED_SCREEN}
      component={ItwCieExpiredOrInvalidScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.PID.CIE.PIN_SCREEN}
      component={ItwCiePinScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.PID.CIE.CARD_READER_SCREEN}
      component={ItwCieCardReaderScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.PID.CIE.CONSENT_DATA_USAGE}
      component={ItwCieConsentDataUsageScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.PID.CIE.WRONG_PIN_SCREEN}
      component={ItwCieWrongPinScreen}
    />

    {/* ISSUANCE PID */}
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.PID.INFO}
      component={ItwIssuancePidInfoScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.PID.AUTH}
      component={ItwIssuancePidAuthScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.PID.AUTH_INFO}
      component={ItwIssuingPidAuthInfoScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.PID.REQUEST}
      component={ItwIssuancePidRequestScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.PID.PREVIEW}
      component={ItwIssuancePidPreviewScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.PID.STORE}
      component={ItwIssuingPidStoreScreen}
    />

    {/* ISSUANCE CREDENTIAL */}
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.CREDENTIAL.CATALOG}
      component={ItwIssuanceCredentialCatalogScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.CREDENTIAL.CHECKS}
      component={ItwIssuanceCredentialChecksScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.CREDENTIAL.AUTH}
      component={ItwIssuanceCredentialAuthScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUANCE.CREDENTIAL.PREVIEW}
      component={ItwIssuanceCredentialPreviewScreen}
    />

    {/* PRESENTATION PID */}
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.PID.DETAILS}
      component={ItwPrPidDetails}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.PID.REMOTE.INIT}
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
      name={ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.INIT}
      component={ItwPrRemoteCredentialInitScreen}
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
