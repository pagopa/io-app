import {
  TransitionPresets,
  createStackNavigator
} from "@react-navigation/stack";
import { IOVisualCostants } from "@pagopa/io-app-design-system";
import { Platform } from "react-native";
import CieLoginConfigScreen from "../features/cieLogin/components/screens/CieLoginConfigScreen";
import IdpLoginScreen from "../screens/authentication/IdpLoginScreen";
import IdpSelectionScreen from "../screens/authentication/IdpSelectionScreen";
import { LandingScreen } from "../screens/authentication/LandingScreen";
import TestAuthenticationScreen from "../screens/authentication/TestAuthenticationScreen";
import { CieCardReaderScreenWrapper } from "../screens/authentication/cie/CieCardReaderScreenWrapper";
import CieConsentDataUsageScreen from "../screens/authentication/cie/CieConsentDataUsageScreen";
import CieExpiredOrInvalidScreen from "../screens/authentication/cie/CieExpiredOrInvalidScreen";
import CiePinScreen from "../screens/authentication/cie/CiePinScreen";
import CieWrongCiePinScreen from "../screens/authentication/cie/CieWrongCiePinScreen";
import { AuthSessionPage } from "../screens/authentication/idpAuthSessionHandler";
import RootedDeviceModal from "../screens/modal/RootedDeviceModal";
import { isGestureEnabled } from "../utils/navigation";
import CieUnexpectedErrorScreen from "../screens/authentication/cie/CieUnexpectedErrorScreen";
import CieExtendedApduNotSupportedScreen from "../screens/authentication/cie/CieExtendedApduNotSupportedScreen";
import CieWrongCardScreen from "../screens/authentication/cie/CieWrongCardScreen";
import ActivateNfcScreen from "../screens/authentication/cie/ActivateNfcScreen";
import AuthErrorScreen from "../screens/authentication/AuthErrorScreen";
import OptInScreen from "../screens/authentication/OptInScreen";
import CieIdWizard from "../features/cie/screens/wizards/CieIdWizard";
import CiePinWizard from "../features/cie/screens/wizards/CiePinWizard";
import SpidWizard from "../features/cie/screens/wizards/SpidWizard";
import IDActivationWizard from "../features/cie/screens/wizards/IDActivationWizard";
import CieIdErrorScreen from "../features/cie/screens/errors/CieIdErrorScreen";
import CieIdLoginScreen from "../features/cieLogin/components/screens/CieIdLoginScreen";
import CieIdNotInstalledScreen from "../features/cie/screens/CieIdNotInstalledScreen";
import CieIdAuthUrlError from "../features/cieLogin/components/screens/CieIdAuthUrlError";
import { AuthenticationParamsList } from "./params/AuthenticationParamsList";
import ROUTES from "./routes";
import CloseButton from "./components/CloseButton";

const Stack = createStackNavigator<AuthenticationParamsList>();

const AuthenticationStackNavigator = () => (
  <Stack.Navigator
    initialRouteName={ROUTES.AUTHENTICATION_LANDING}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerShown: false }}
  >
    <Stack.Screen
      name={ROUTES.AUTHENTICATION_LANDING}
      component={LandingScreen}
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
        name={ROUTES.AUTHENTICATION_ROOTED_DEVICE}
        component={RootedDeviceModal}
      />
    </Stack.Group>
    <Stack.Group screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name={ROUTES.AUTHENTICATION_CIE_ID_WIZARD}
        component={CieIdWizard}
      />
      <Stack.Screen
        name={ROUTES.AUTHENTICATION_CIE_PIN_WIZARD}
        component={CiePinWizard}
      />
      <Stack.Screen
        name={ROUTES.AUTHENTICATION_SPID_WIZARD}
        component={SpidWizard}
      />
      <Stack.Screen
        name={ROUTES.AUTHENTICATION_ID_ACTIVATION_WIZARD}
        component={IDActivationWizard}
      />
    </Stack.Group>
    <Stack.Screen
      name={ROUTES.AUTHENTICATION_OPT_IN}
      component={OptInScreen}
      options={{ headerShown: true }}
    />

    <Stack.Screen
      options={{ headerShown: true }}
      name={ROUTES.AUTHENTICATION_IDP_SELECTION}
      component={IdpSelectionScreen}
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
      name={ROUTES.CIE_PIN_SCREEN}
      component={CiePinScreen}
      options={{ headerShown: true }}
    />

    <Stack.Screen
      name={ROUTES.AUTHENTICATION_CIE_ID_LOGIN}
      component={CieIdLoginScreen}
      options={{ headerShown: false }}
    />

    <Stack.Screen
      name={ROUTES.CIE_LOGIN_CONFIG_SCREEN}
      component={CieLoginConfigScreen}
    />

    <Stack.Screen
      name={ROUTES.CIE_CARD_READER_SCREEN}
      component={CieCardReaderScreenWrapper}
    />

    <Stack.Screen
      name={ROUTES.CIE_CONSENT_DATA_USAGE}
      component={CieConsentDataUsageScreen}
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
        name={ROUTES.CIE_WRONG_PIN_SCREEN}
        component={CieWrongCiePinScreen}
      />

      <Stack.Screen
        name={ROUTES.CIE_UNEXPECTED_ERROR}
        component={CieUnexpectedErrorScreen}
      />

      <Stack.Screen
        name={ROUTES.CIE_EXTENDED_APDU_NOT_SUPPORTED_SCREEN}
        component={CieExtendedApduNotSupportedScreen}
      />

      <Stack.Screen
        name={ROUTES.CIE_WRONG_CARD_SCREEN}
        component={CieWrongCardScreen}
      />

      <Stack.Screen
        name={ROUTES.AUTH_ERROR_SCREEN}
        component={AuthErrorScreen}
      />

      <Stack.Screen
        name={ROUTES.CIE_EXPIRED_SCREEN}
        component={CieExpiredOrInvalidScreen}
      />
      <Stack.Screen
        name={ROUTES.AUTHENTICATION_CIE_ID_ERROR}
        component={CieIdErrorScreen}
      />
      <Stack.Screen
        name={ROUTES.AUTHENTICATION_CIE_ID_INCORRECT_URL}
        component={CieIdAuthUrlError}
      />
      <Stack.Screen
        name={ROUTES.CIE_NOT_INSTALLED}
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
        name={ROUTES.CIE_ACTIVATE_NFC_SCREEN}
        component={ActivateNfcScreen}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default AuthenticationStackNavigator;
