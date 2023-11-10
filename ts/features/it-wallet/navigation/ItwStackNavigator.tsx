import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { isGestureEnabled } from "../../../utils/navigation";
import ItwCiePinScreen from "../screens/issuing/cie/ItwCiePinScreen";
import CieCardReaderScreen from "../screens/issuing/cie/ItwCieCardReaderScreen";
import CieConsentDataUsageScreen from "../screens/issuing/cie/ItwCieConsentDataUsageScreen";
import CieExpiredOrInvalidScreen from "../screens/issuing/cie/ItwCieExpiredOrInvalidScreen";
import CieWrongCiePinScreen from "../screens/issuing/cie/ItwCieWrongPinScreen";
import ItwDiscoveryInfoScreen from "../screens/discovery/ItwDiscoveryInfoScreen";
import ItwPidAuthInfoScreen from "../screens/issuing/ItwPidAuthInfoScreen";
import ItwPidPreviewScreen from "../screens/issuing/ItwPidPreviewScreen";
import ItwPidAddingScreen from "../screens/issuing/ItwPidAddingScreen";
import ItwCredentialDetails from "../screens/credential/ItwPidDetails";
import ItwPidRequestScreen from "../screens/issuing/ItwPidRequestScreen";
import ItwRpInitScreen from "../screens/presentation/crossdevice/ItwRpInitScreen";
import ItwPresentationScreen from "../screens/presentation/crossdevice/ItwRpPresentationScreen";
import ItwDiscoveryProviderInfoScreen from "../screens/discovery/ItwDiscoveryProviderInfoScreen";
import ItwMissingFeatureScreen from "../screens/generic/ItwMissingFeatureScreen";
import ItwCredentialPreviewScreen from "../screens/credential/issuing/ItwCredentialPreviewScreen";
import ItwCredentialAuthScreen from "../screens/credential/issuing/ItwCredentialAuthScreen";
import ItwChecksScreen from "../screens/presentation/crossdevice/new/ItwPresentationChecksScreen";
import ItwPresentationDataScreen from "../screens/presentation/crossdevice/new/ItwPresentationDataScreen";
import ItwPresentationResultScreen from "../screens/presentation/crossdevice/new/ItwPresentationResultScreen";
import ItwCredentialsChecksScreen from "../screens/credential/issuing/ItwCredentialChecksScreen";
import ItwCredentialCatalogScreen from "../screens/credential/issuing/ItwCredentialsCatalogScreen";
import ItwCredentialDetailsScreen from "../screens/credential/ItwCredentialDetailsScreen";
import { ItwParamsList } from "./ItwParamsList";
import { ITW_ROUTES } from "./ItwRoutes";

const Stack = createStackNavigator<ItwParamsList>();

export const ItwStackNavigator = () => (
  <Stack.Navigator
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
  >
    {/* Discovery */}
    <Stack.Screen
      name={ITW_ROUTES.DISCOVERY.INFO}
      component={ItwDiscoveryInfoScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.DISCOVERY.FEATURES_INFO}
      component={ItwDiscoveryProviderInfoScreen}
    />
    {/* Issuing CIE */}
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.CIE.PIN_SCREEN}
      component={ItwCiePinScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.CIE.CONSENT_DATA_USAGE}
      component={CieConsentDataUsageScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.CIE.CARD_READER_SCREEN}
      component={CieCardReaderScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.CIE.EXPIRED_SCREEN}
      component={CieExpiredOrInvalidScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.CIE.WRONG_PIN_SCREEN}
      component={CieWrongCiePinScreen}
    />
    {/* Issuing PID */}
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID_AUTH_INFO}
      component={ItwPidAuthInfoScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID_REQUEST}
      component={ItwPidRequestScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID_PREVIEW}
      component={ItwPidPreviewScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID_ADDING}
      component={ItwPidAddingScreen}
    />
    {/* PRESENTATION PID DETAILS */}
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.PID_DETAILS}
      component={ItwCredentialDetails}
    />
    {/* PRESENTATION CREDENTIAL DETAILS */}
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAILS}
      component={ItwCredentialDetailsScreen}
    />
    {/* PRESENTATION CROSS DEVICE */}
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CROSS_DEVICE.CHECKS}
      component={ItwChecksScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CROSS_DEVICE.DATA}
      component={ItwPresentationDataScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CROSS_DEVICE.RESULT_NEW}
      component={ItwPresentationResultScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CROSS_DEVICE.INIT}
      component={ItwRpInitScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CROSS_DEVICE.RESULT}
      component={ItwPresentationScreen}
    />
    {/* CREDENTIAL ISSUING */}
    <Stack.Screen
      name={ITW_ROUTES.CREDENTIAL.ISSUING.CATALOG}
      component={ItwCredentialCatalogScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.CREDENTIAL.ISSUING.CHECKS}
      component={ItwCredentialsChecksScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.CREDENTIAL.ISSUING.AUTH}
      component={ItwCredentialAuthScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.CREDENTIAL.ISSUING.PREVIEW}
      component={ItwCredentialPreviewScreen}
    />
    {/* COMMON */}
    <Stack.Screen
      name={ITW_ROUTES.GENERIC.NOT_AVAILABLE}
      component={ItwMissingFeatureScreen}
    />
  </Stack.Navigator>
);
