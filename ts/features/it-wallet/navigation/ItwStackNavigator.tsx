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
import ItwPidDetails from "../screens/credential/ItwPidDetails";
import ItwPidRequestScreen from "../screens/issuing/ItwPidRequestScreen";
import ItwRpInitScreen from "../screens/presentation/crossdevice/ItwRpInitScreen";
import ItwPresentationScreen from "../screens/presentation/crossdevice/ItwRpPresentationScreen";
import ItwDiscoveryProviderInfoScreen from "../screens/discovery/ItwDiscoveryProviderInfoScreen";
import ItwMissingFeatureScreen from "../screens/generic/ItwMissingFeatureScreen";
import ItwCredentialPreviewScreen from "../screens/credential/issuing/ItwCredentialPreviewScreen";
import ItwCredentialAuthScreen from "../screens/credential/issuing/ItwCredentialAuthScreen";
import ItwPresentationChecksScreen from "../screens/presentation/crossdevice/new/ItwPresentationChecksScreen";
import ItwPresentationDataScreen from "../screens/presentation/crossdevice/new/ItwPresentationDataScreen";
import ItwPresentationResultScreen from "../screens/presentation/crossdevice/new/ItwPresentationResultScreen";
import ItwCredentialsChecksScreen from "../screens/credential/issuing/ItwCredentialChecksScreen";
import ItwCredentialCatalogScreen from "../screens/credential/issuing/ItwCredentialsCatalogScreen";
import ItwCredentialDetailsScreen from "../screens/credential/ItwCredentialDetailsScreen";
import ItwPidPresentationDataScreen from "../screens/presentation/crossdevice/ItwPidPresentationDataScreen";
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
      component={CieExpiredOrInvalidScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.CIE.PIN_SCREEN}
      component={ItwCiePinScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.CIE.CARD_READER_SCREEN}
      component={CieCardReaderScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.CIE.CONSENT_DATA_USAGE}
      component={CieConsentDataUsageScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.CIE.WRONG_PIN_SCREEN}
      component={CieWrongCiePinScreen}
    />

    {/* ISSUING PID */}
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.INFO}
      component={ItwDiscoveryInfoScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.ISSUING.PID.AUTH}
      component={ItwDiscoveryProviderInfoScreen}
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
      component={ItwPidDetails}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.PID.REMOTE.CHECKS}
      component={ItwRpInitScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.PID.REMOTE.DATA}
      component={ItwPidPresentationDataScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.PID.REMOTE.RESULT}
      component={ItwPresentationScreen}
    />

    {/* CREDENTIAL PRESENTATION */}
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CREDENTIAL.DETAILS}
      component={ItwCredentialDetailsScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.CHECKS}
      component={ItwPresentationChecksScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.DATA}
      component={ItwPresentationDataScreen}
    />
    <Stack.Screen
      name={ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.RESULT}
      component={ItwPresentationResultScreen}
    />

    {/* GENERIC */}
    <Stack.Screen
      name={ITW_ROUTES.GENERIC.NOT_AVAILABLE}
      component={ItwMissingFeatureScreen}
    />
  </Stack.Navigator>
);
