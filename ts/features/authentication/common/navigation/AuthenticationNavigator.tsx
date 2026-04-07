import { IOVisualCostants } from "@pagopa/io-app-design-system";
import {
  createStackNavigator,
  TransitionPresets
} from "@react-navigation/stack";
import { Platform } from "react-native";

import CloseButton from "../../../../navigation/components/CloseButton";
import RootedDeviceModal from "../../../../screens/modal/RootedDeviceModal";
import { isGestureEnabled } from "../../../../utils/navigation";
import { ActiveSessionLandingScreen } from "../../activeSessionLogin/screens/ActiveSessionLandingScreen";
import ActiveSessionLoginCieCardReaderScreen from "../../activeSessionLogin/screens/cie/ActiveSessionLoginCieCardReaderScreen";
import ActiveSessionLoginCieConsentDataUsageScreen from "../../activeSessionLogin/screens/cie/ActiveSessionLoginCieConsentDataUsageScreen";
import ActiveSessionCieIdLoginScreen from "../../activeSessionLogin/screens/cieId/ActiveSessionCieIdLoginScreen";
import ActiveSessionIdpLoginScreen from "../../activeSessionLogin/screens/spid/ActiveSessionIdpLoginScreen";
import AuthErrorScreen from "../../login/authError/screens/AuthErrorScreen";
import ActivateNfcScreen from "../../login/cie/screens/ActivateNfcScreen";
import { CieCardReaderScreenWrapper } from "../../login/cie/screens/CieCardReaderScreenWrapper";
import CieConsentDataUsageScreen from "../../login/cie/screens/CieConsentDataUsageScreen";
import CieExpiredOrInvalidScreen from "../../login/cie/screens/CieExpiredOrInvalidScreen";
import CieExtendedApduNotSupportedScreen from "../../login/cie/screens/CieExtendedApduNotSupportedScreen";
import CieIdAuthUrlError from "../../login/cie/screens/CieIdAuthUrlError";
import CieIdErrorScreen from "../../login/cie/screens/CieIdErrorScreen";
import CieIdLoginScreen from "../../login/cie/screens/CieIdLoginScreen";
import CieIdNotInstalledScreen from "../../login/cie/screens/CieIdNotInstalledScreen";
import CieLoginConfigScreen from "../../login/cie/screens/CieLoginConfigScreen";
import CiePinScreen from "../../login/cie/screens/CiePinScreen";
import CieUnexpectedErrorScreen from "../../login/cie/screens/CieUnexpectedErrorScreen";
import CieWrongCardScreen from "../../login/cie/screens/CieWrongCardScreen";
import CieWrongCiePinScreen from "../../login/cie/screens/CieWrongCiePinScreen";
import CieIdWizard from "../../login/cie/screens/wizards/CieIdWizard";
import CiePinWizard from "../../login/cie/screens/wizards/CiePinWizard";
import IDActivationWizard from "../../login/cie/screens/wizards/IDActivationWizard";
import SpidWizard from "../../login/cie/screens/wizards/SpidWizard";
import { AuthSessionPage } from "../../login/idp/screens/idpAuthSessionHandler";
import IdpLoginScreen from "../../login/idp/screens/IdpLoginScreen";
import IdpSelectionScreen from "../../login/idp/screens/IdpSelectionScreen";
import { LandingScreen } from "../../login/landing/screens/LandingScreen";
import OptInScreen from "../../login/optIn/screens/OptInScreen";
import TestAuthenticationScreen from "../screens/TestAuthenticationScreen";
import { AuthenticationParamsList } from "./params/AuthenticationParamsList";
import { AUTHENTICATION_ROUTES } from "./routes";

const Stack = createStackNavigator<AuthenticationParamsList>();

const AuthenticationStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={AUTHENTICATION_ROUTES.LANDING}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
  >
    <Stack.Screen
      component={LandingScreen}
      name={AUTHENTICATION_ROUTES.LANDING}
      options={{ headerShown: true }}
    />

    <Stack.Screen
      component={ActiveSessionLandingScreen}
      name={AUTHENTICATION_ROUTES.LANDING_ACTIVE_SESSION_LOGIN}
      options={{ headerShown: true }}
    />

    <Stack.Group
      screenOptions={{
        gestureEnabled: false,
        headerShown: false,
        ...TransitionPresets.ModalSlideFromBottomIOS
      }}
    >
      <Stack.Screen
        component={RootedDeviceModal}
        name={AUTHENTICATION_ROUTES.ROOTED_DEVICE}
      />
    </Stack.Group>
    <Stack.Group screenOptions={{ headerShown: true }}>
      <Stack.Screen
        component={CieIdWizard}
        name={AUTHENTICATION_ROUTES.CIE_ID_WIZARD}
      />
      <Stack.Screen
        component={CiePinWizard}
        name={AUTHENTICATION_ROUTES.CIE_PIN_WIZARD}
      />
      <Stack.Screen
        component={SpidWizard}
        name={AUTHENTICATION_ROUTES.SPID_WIZARD}
      />
      <Stack.Screen
        component={IDActivationWizard}
        name={AUTHENTICATION_ROUTES.ID_ACTIVATION_WIZARD}
      />
      <Stack.Screen
        component={CieLoginConfigScreen}
        name={AUTHENTICATION_ROUTES.CIE_LOGIN_CONFIG_SCREEN}
      />
    </Stack.Group>
    <Stack.Screen
      component={OptInScreen}
      name={AUTHENTICATION_ROUTES.OPT_IN}
      options={{ headerShown: true }}
    />

    <Stack.Screen
      component={IdpSelectionScreen}
      name={AUTHENTICATION_ROUTES.IDP_SELECTION}
      options={{ headerShown: true }}
    />

    <Stack.Screen
      component={IdpLoginScreen}
      name={AUTHENTICATION_ROUTES.IDP_LOGIN}
    />
    <Stack.Screen
      component={ActiveSessionIdpLoginScreen}
      name={AUTHENTICATION_ROUTES.IDP_LOGIN_ACTIVE_SESSION_LOGIN}
    />

    <Stack.Screen
      component={AuthSessionPage}
      name={AUTHENTICATION_ROUTES.AUTH_SESSION}
    />

    <Stack.Screen
      component={TestAuthenticationScreen}
      name={AUTHENTICATION_ROUTES.IDP_TEST}
    />

    <Stack.Screen
      component={CiePinScreen}
      name={AUTHENTICATION_ROUTES.CIE_PIN_SCREEN}
      options={{ headerShown: true }}
    />

    <Stack.Screen
      component={CieIdLoginScreen}
      name={AUTHENTICATION_ROUTES.CIE_ID_LOGIN}
      options={{ headerShown: false }}
    />

    <Stack.Screen
      component={ActiveSessionCieIdLoginScreen}
      name={AUTHENTICATION_ROUTES.CIE_ID_ACTIVE_SESSION_LOGIN}
      options={{ headerShown: false }}
    />

    <Stack.Screen
      component={CieCardReaderScreenWrapper}
      name={AUTHENTICATION_ROUTES.CIE_CARD_READER_SCREEN}
    />

    <Stack.Screen
      component={ActiveSessionLoginCieCardReaderScreen}
      name={AUTHENTICATION_ROUTES.CIE_CARD_READER_SCREEN_ACTIVE_SESSION_LOGIN}
    />

    <Stack.Screen
      component={CieConsentDataUsageScreen}
      name={AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE}
      options={{ headerShown: true }}
    />

    <Stack.Screen
      component={ActiveSessionLoginCieConsentDataUsageScreen}
      name={AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE_ACTIVE_SESSION_LOGIN}
      options={{ headerShown: true }}
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
        component={CieWrongCiePinScreen}
        name={AUTHENTICATION_ROUTES.CIE_WRONG_PIN_SCREEN}
      />

      <Stack.Screen
        component={CieUnexpectedErrorScreen}
        name={AUTHENTICATION_ROUTES.CIE_UNEXPECTED_ERROR}
      />

      <Stack.Screen
        component={CieExtendedApduNotSupportedScreen}
        name={AUTHENTICATION_ROUTES.CIE_EXTENDED_APDU_NOT_SUPPORTED_SCREEN}
      />

      <Stack.Screen
        component={CieWrongCardScreen}
        name={AUTHENTICATION_ROUTES.CIE_WRONG_CARD_SCREEN}
      />

      <Stack.Screen
        component={AuthErrorScreen}
        name={AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN}
      />

      <Stack.Screen
        component={CieExpiredOrInvalidScreen}
        name={AUTHENTICATION_ROUTES.CIE_EXPIRED_SCREEN}
      />
      <Stack.Screen
        component={CieIdErrorScreen}
        name={AUTHENTICATION_ROUTES.CIE_ID_ERROR}
      />
      <Stack.Screen
        component={CieIdAuthUrlError}
        name={AUTHENTICATION_ROUTES.CIE_ID_INCORRECT_URL}
      />
      <Stack.Screen
        component={CieIdNotInstalledScreen}
        name={AUTHENTICATION_ROUTES.CIE_NOT_INSTALLED}
      />
    </Stack.Group>

    <Stack.Group
      screenOptions={{
        presentation: "modal",
        headerLeft: () => null,
        headerTitle: () => null,
        headerRight: CloseButton,
        headerStyle: {
          height: IOVisualCostants.headerHeight,
          // shadowOpacity and elevation are set to 0 to hide the shadow under the header
          elevation: 0,
          shadowOpacity: 0
        },
        headerShown: true
      }}
    >
      <Stack.Screen
        component={ActivateNfcScreen}
        name={AUTHENTICATION_ROUTES.CIE_ACTIVATE_NFC_SCREEN}
        options={{ headerShown: true }}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default AuthenticationStackNavigator;
