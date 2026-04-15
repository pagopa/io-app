import {
  TransitionPresets,
  createStackNavigator
} from "@react-navigation/stack";
import { IOVisualCostants } from "@pagopa/io-app-design-system";
import { Platform } from "react-native";
import CieLoginConfigScreen from "../../login/cie/screens/CieLoginConfigScreen";
import IdpLoginScreen from "../../login/idp/screens/IdpLoginScreen";
import IdpSelectionScreen from "../../login/idp/screens/IdpSelectionScreen";
import { LandingScreen } from "../../login/landing/screens/LandingScreen";
import TestAuthenticationScreen from "../screens/TestAuthenticationScreen";
import { CieCardReaderScreenWrapper } from "../../login/cie/screens/CieCardReaderScreenWrapper";
import CieConsentDataUsageScreen from "../../login/cie/screens/CieConsentDataUsageScreen";
import CieExpiredOrInvalidScreen from "../../login/cie/screens/CieExpiredOrInvalidScreen";
import CiePinScreen from "../../login/cie/screens/CiePinScreen";
import CieWrongCiePinScreen from "../../login/cie/screens/CieWrongCiePinScreen";
import { AuthSessionPage } from "../../login/idp/screens/idpAuthSessionHandler";
import RootedDeviceModal from "../../../../screens/modal/RootedDeviceModal";
import { isGestureEnabled } from "../../../../utils/navigation";
import CieUnexpectedErrorScreen from "../../login/cie/screens/CieUnexpectedErrorScreen";
import CieExtendedApduNotSupportedScreen from "../../login/cie/screens/CieExtendedApduNotSupportedScreen";
import CieWrongCardScreen from "../../login/cie/screens/CieWrongCardScreen";
import ActivateNfcScreen from "../../login/cie/screens/ActivateNfcScreen";
import AuthErrorScreen from "../../login/authError/screens/AuthErrorScreen";
import OptInScreen from "../../login/optIn/screens/OptInScreen";
import CieIdWizard from "../../login/cie/screens/wizards/CieIdWizard";
import CiePinWizard from "../../login/cie/screens/wizards/CiePinWizard";
import SpidWizard from "../../login/cie/screens/wizards/SpidWizard";
import IDActivationWizard from "../../login/cie/screens/wizards/IDActivationWizard";
import CieIdErrorScreen from "../../login/cie/screens/CieIdErrorScreen";
import CieIdLoginScreen from "../../login/cie/screens/CieIdLoginScreen";
import CieIdNotInstalledScreen from "../../login/cie/screens/CieIdNotInstalledScreen";
import CieIdAuthUrlError from "../../login/cie/screens/CieIdAuthUrlError";
import CloseButton from "../../../../navigation/components/CloseButton";
import { ActiveSessionLandingScreen } from "../../activeSessionLogin/screens/ActiveSessionLandingScreen";
import ActiveSessionCieIdLoginScreen from "../../activeSessionLogin/screens/cieId/ActiveSessionCieIdLoginScreen";
import ActiveSessionLoginCieCardReaderScreen from "../../activeSessionLogin/screens/cie/ActiveSessionLoginCieCardReaderScreen";
import ActiveSessionLoginCieConsentDataUsageScreen from "../../activeSessionLogin/screens/cie/ActiveSessionLoginCieConsentDataUsageScreen";
import ActiveSessionIdpLoginScreen from "../../activeSessionLogin/screens/spid/ActiveSessionIdpLoginScreen";
import { AUTHENTICATION_ROUTES } from "./routes";
import { AuthenticationParamsList } from "./params/AuthenticationParamsList";

const Stack = createStackNavigator<AuthenticationParamsList>();

const AuthenticationStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={AUTHENTICATION_ROUTES.LANDING}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
  >
    <Stack.Screen
      name={AUTHENTICATION_ROUTES.LANDING}
      component={LandingScreen}
      options={{ headerShown: true }}
    />

    <Stack.Screen
      name={AUTHENTICATION_ROUTES.LANDING_ACTIVE_SESSION_LOGIN}
      component={ActiveSessionLandingScreen}
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
        name={AUTHENTICATION_ROUTES.ROOTED_DEVICE}
        component={RootedDeviceModal}
      />
    </Stack.Group>
    <Stack.Group screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name={AUTHENTICATION_ROUTES.CIE_ID_WIZARD}
        component={CieIdWizard}
      />
      <Stack.Screen
        name={AUTHENTICATION_ROUTES.CIE_PIN_WIZARD}
        component={CiePinWizard}
      />
      <Stack.Screen
        name={AUTHENTICATION_ROUTES.SPID_WIZARD}
        component={SpidWizard}
      />
      <Stack.Screen
        name={AUTHENTICATION_ROUTES.ID_ACTIVATION_WIZARD}
        component={IDActivationWizard}
      />
      <Stack.Screen
        name={AUTHENTICATION_ROUTES.CIE_LOGIN_CONFIG_SCREEN}
        component={CieLoginConfigScreen}
      />
    </Stack.Group>
    <Stack.Screen
      name={AUTHENTICATION_ROUTES.OPT_IN}
      component={OptInScreen}
      options={{ headerShown: true }}
    />

    <Stack.Screen
      options={{ headerShown: true }}
      name={AUTHENTICATION_ROUTES.IDP_SELECTION}
      component={IdpSelectionScreen}
    />

    <Stack.Screen
      name={AUTHENTICATION_ROUTES.IDP_LOGIN}
      component={IdpLoginScreen}
    />
    <Stack.Screen
      name={AUTHENTICATION_ROUTES.IDP_LOGIN_ACTIVE_SESSION_LOGIN}
      component={ActiveSessionIdpLoginScreen}
    />

    <Stack.Screen
      name={AUTHENTICATION_ROUTES.AUTH_SESSION}
      component={AuthSessionPage}
    />

    <Stack.Screen
      name={AUTHENTICATION_ROUTES.IDP_TEST}
      component={TestAuthenticationScreen}
    />

    <Stack.Screen
      name={AUTHENTICATION_ROUTES.CIE_PIN_SCREEN}
      component={CiePinScreen}
      options={{ headerShown: true }}
    />

    <Stack.Screen
      name={AUTHENTICATION_ROUTES.CIE_ID_LOGIN}
      component={CieIdLoginScreen}
      options={{ headerShown: false }}
    />

    <Stack.Screen
      name={AUTHENTICATION_ROUTES.CIE_ID_ACTIVE_SESSION_LOGIN}
      component={ActiveSessionCieIdLoginScreen}
      options={{ headerShown: false }}
    />

    <Stack.Screen
      name={AUTHENTICATION_ROUTES.CIE_CARD_READER_SCREEN}
      component={CieCardReaderScreenWrapper}
    />

    <Stack.Screen
      name={AUTHENTICATION_ROUTES.CIE_CARD_READER_SCREEN_ACTIVE_SESSION_LOGIN}
      component={ActiveSessionLoginCieCardReaderScreen}
    />

    <Stack.Screen
      name={AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE}
      component={CieConsentDataUsageScreen}
      options={{ headerShown: true }}
    />

    <Stack.Screen
      name={AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE_ACTIVE_SESSION_LOGIN}
      component={ActiveSessionLoginCieConsentDataUsageScreen}
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
        name={AUTHENTICATION_ROUTES.CIE_WRONG_PIN_SCREEN}
        component={CieWrongCiePinScreen}
      />

      <Stack.Screen
        name={AUTHENTICATION_ROUTES.CIE_UNEXPECTED_ERROR}
        component={CieUnexpectedErrorScreen}
      />

      <Stack.Screen
        name={AUTHENTICATION_ROUTES.CIE_EXTENDED_APDU_NOT_SUPPORTED_SCREEN}
        component={CieExtendedApduNotSupportedScreen}
      />

      <Stack.Screen
        name={AUTHENTICATION_ROUTES.CIE_WRONG_CARD_SCREEN}
        component={CieWrongCardScreen}
      />

      <Stack.Screen
        name={AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN}
        component={AuthErrorScreen}
      />

      <Stack.Screen
        name={AUTHENTICATION_ROUTES.CIE_EXPIRED_SCREEN}
        component={CieExpiredOrInvalidScreen}
      />
      <Stack.Screen
        name={AUTHENTICATION_ROUTES.CIE_ID_ERROR}
        component={CieIdErrorScreen}
      />
      <Stack.Screen
        name={AUTHENTICATION_ROUTES.CIE_ID_INCORRECT_URL}
        component={CieIdAuthUrlError}
      />
      <Stack.Screen
        name={AUTHENTICATION_ROUTES.CIE_NOT_INSTALLED}
        component={CieIdNotInstalledScreen}
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
        options={{ headerShown: true }}
        name={AUTHENTICATION_ROUTES.CIE_ACTIVATE_NFC_SCREEN}
        component={ActivateNfcScreen}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default AuthenticationStackNavigator;
