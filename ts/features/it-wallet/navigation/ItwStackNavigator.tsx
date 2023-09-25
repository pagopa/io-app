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
import CieInfoUsageScreen from "../screens/issuing/cie/ItwCieInfoUsageScreen";
import ItwPidPreviewScreen from "../screens/issuing/ItwPidPreviewScreen";
import ItwPidAddingScreen from "../screens/issuing/ItwPidAddingScreen";
import ItwCredentialDetails from "../screens/credentials/ItwPidDetails";
import ItwPidRequestScreen from "../screens/issuing/ItwPidRequestScreen";
import ItwRpInitScreen from "../screens/presentation/crossdevice/ItwRpInitScreen";
import ItwPresentationScreen from "../screens/presentation/crossdevice/ItwRpPresentationScreen";
import ItwDiscoveryProviderInfoScreen from "../screens/discovery/ItwDiscoveryProviderInfoScreen";
import ItwCredentialsCatalogScreen from "../screens/ItwCredentialsCatalogScreen";
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
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.CIE.INFO_USAGE_SCREEN}
      component={CieInfoUsageScreen}
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
    {/* PRESENTATION CROSS DEVICE */}
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CROSS_DEVICE.INIT}
      component={ItwRpInitScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CROSS_DEVICE.RESULT}
      component={ItwPresentationScreen}
    />
    {/* CREDENTIALS */}
    <Stack.Screen
      name={ITW_ROUTES.CREDENTIALS.CATALOG}
      component={ItwCredentialsCatalogScreen}
    />
  </Stack.Navigator>
);
