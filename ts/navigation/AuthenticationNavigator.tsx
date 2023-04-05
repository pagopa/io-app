import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import CardSelectionScreen from "../screens/authentication/CardSelectionScreen";
import CieAuthorizeDataUsageScreen from "../screens/authentication/cie/CieAuthorizeDataUsageScreen";
import CieCardReaderScreen from "../screens/authentication/cie/CieCardReaderScreen";
import CieConsentDataUsageScreen from "../screens/authentication/cie/CieConsentDataUsageScreen";
import CieExpiredOrInvalidScreen from "../screens/authentication/cie/CieExpiredOrInvalidScreen";
import CiePinLockedTemporarilyScreen from "../screens/authentication/cie/CiePinLockedTemporarilyScreen";
import CiePinScreen from "../screens/authentication/cie/CiePinScreen";
import CieWrongCiePinScreen from "../screens/authentication/cie/CieWrongCiePinScreen";
import IdpLoginScreen from "../screens/authentication/IdpLoginScreen";
import IdpSelectionScreen from "../screens/authentication/IdpSelectionScreen";
import LandingScreen from "../screens/authentication/LandingScreen";
import SpidCIEInformationScreen from "../screens/authentication/SpidCIEInformationScreen";
import SpidInformationScreen from "../screens/authentication/SpidInformationScreen";
import TestAuthenticationScreen from "../screens/authentication/TestAuthenticationScreen";
import MarkdownScreen from "../screens/development/MarkdownScreen";
import { AuthSessionPage } from "../screens/authentication/idpAuthSessionHandler";
import { AuthenticationParamsList } from "./params/AuthenticationParamsList";
import ROUTES from "./routes";

const Stack = createStackNavigator<AuthenticationParamsList>();

const AuthenticationStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={ROUTES.AUTHENTICATION_LANDING}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: true }}
  >
    <Stack.Screen
      name={ROUTES.AUTHENTICATION_LANDING}
      component={LandingScreen}
    />

    <Stack.Screen
      name={ROUTES.AUTHENTICATION_IDP_SELECTION}
      component={IdpSelectionScreen}
    />

    <Stack.Screen
      name={ROUTES.AUTHENTICATION_CIE}
      component={CardSelectionScreen}
    />

    <Stack.Screen
      name={ROUTES.AUTHENTICATION_IDP_LOGIN}
      component={IdpLoginScreen}
    />

    <Stack.Screen
      name={ROUTES.AUTHENTICATION_AUTH_SESSION}
      component={AuthSessionPage}
    />

    <Stack.Screen
      name={ROUTES.AUTHENTICATION_IDP_TEST}
      component={TestAuthenticationScreen}
    />

    <Stack.Screen
      name={ROUTES.AUTHENTICATION_SPID_INFORMATION}
      component={SpidInformationScreen}
    />

    <Stack.Screen
      name={ROUTES.AUTHENTICATION_SPID_CIE_INFORMATION}
      component={SpidCIEInformationScreen}
    />

    <Stack.Screen name={ROUTES.MARKDOWN} component={MarkdownScreen} />

    <Stack.Screen
      name={ROUTES.CIE_EXPIRED_SCREEN}
      component={CieExpiredOrInvalidScreen}
    />

    <Stack.Screen name={ROUTES.CIE_PIN_SCREEN} component={CiePinScreen} />

    <Stack.Screen
      name={ROUTES.CIE_AUTHORIZE_USAGE_SCREEN}
      component={CieAuthorizeDataUsageScreen}
    />

    <Stack.Screen
      name={ROUTES.CIE_CARD_READER_SCREEN}
      component={CieCardReaderScreen}
    />

    <Stack.Screen
      name={ROUTES.CIE_CONSENT_DATA_USAGE}
      component={CieConsentDataUsageScreen}
    />

    <Stack.Screen
      name={ROUTES.CIE_WRONG_PIN_SCREEN}
      component={CieWrongCiePinScreen}
    />

    <Stack.Screen
      name={ROUTES.CIE_PIN_TEMP_LOCKED_SCREEN}
      component={CiePinLockedTemporarilyScreen}
    />
  </Stack.Navigator>
);

export default AuthenticationStackNavigator;
