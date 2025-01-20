import { createStackNavigator } from "@react-navigation/stack";
import OnboardingCompletedScreen from "../screens/onboarding/OnboardingCompletedScreen";
import { OnboardingNotificationsInfoScreenConsent } from "../features/pushNotifications/screens/OnboardingNotificationsInfoScreenConsent";
import { OnboardingNotificationsPreferencesScreen } from "../features/pushNotifications/screens/OnboardingNotificationsPreferencesScreen";
import OnboardingPinScreen from "../screens/onboarding/OnboardingPinScreen";
import OnboardingServicesPreferenceScreen from "../screens/onboarding/OnboardingServicesPreferenceScreen";
import OnboardingShareDataScreen from "../screens/onboarding/OnboardingShareDataScreen";
import OnboardingTosScreen from "../screens/onboarding/OnboardingTosScreen";
import ServicePreferenceCompleteScreen from "../screens/onboarding/ServicePreferenceCompleteScreen";
import FingerprintScreen from "../screens/onboarding/biometric&securityChecks/FingerprintScreen";
import MissingDeviceBiometricScreen from "../screens/onboarding/biometric&securityChecks/MissingDeviceBiometricScreen";
import MissingDevicePinScreen from "../screens/onboarding/biometric&securityChecks/MissingDevicePinScreen";
import { isGestureEnabled } from "../utils/navigation";
import EmailValidationSendEmailScreen from "../screens/profile/EmailValidationSendEmailScreen";
import EmailInsertScreen from "../screens/profile/EmailInsertScreen";
import { OnboardingParamsList } from "./params/OnboardingParamsList";
import ROUTES from "./routes";

const Stack = createStackNavigator<OnboardingParamsList>();
/**
 * The onboarding related stack of screens of the application.
 */
const OnboardingNavigator = () => (
  <Stack.Navigator
    initialRouteName={ROUTES.ONBOARDING_SHARE_DATA}
    screenOptions={{ gestureEnabled: isGestureEnabled, headerMode: "screen" }}
  >
    <Stack.Screen
      name={ROUTES.ONBOARDING_SHARE_DATA}
      component={OnboardingShareDataScreen}
    />
    <Stack.Screen
      name={ROUTES.ONBOARDING_SERVICES_PREFERENCE}
      component={OnboardingServicesPreferenceScreen}
    />
    <Stack.Screen
      options={{ headerShown: false }}
      name={ROUTES.ONBOARDING_SERVICES_PREFERENCE_COMPLETE}
      component={ServicePreferenceCompleteScreen}
    />
    <Stack.Screen
      options={{ headerShown: true }}
      name={ROUTES.ONBOARDING_TOS}
      component={OnboardingTosScreen}
    />
    <Stack.Screen
      name={ROUTES.ONBOARDING_PIN}
      component={OnboardingPinScreen}
    />
    <Stack.Screen
      options={{ headerShown: false }}
      name={ROUTES.ONBOARDING_FINGERPRINT}
      component={FingerprintScreen}
    />
    <Stack.Screen
      options={{ headerShown: false }}
      name={ROUTES.ONBOARDING_MISSING_DEVICE_PIN}
      component={MissingDevicePinScreen}
    />
    <Stack.Screen
      options={{ headerShown: false }}
      name={ROUTES.ONBOARDING_MISSING_DEVICE_BIOMETRIC}
      component={MissingDeviceBiometricScreen}
    />
    <Stack.Screen
      options={{ gestureEnabled: false }}
      name={ROUTES.ONBOARDING_INSERT_EMAIL_SCREEN}
      component={EmailInsertScreen}
    />

    <Stack.Screen
      options={{ gestureEnabled: false, headerShown: false }}
      name={ROUTES.ONBOARDING_EMAIL_VERIFICATION_SCREEN}
      component={EmailValidationSendEmailScreen}
    />
    <Stack.Screen
      options={{ headerShown: false }}
      name={ROUTES.ONBOARDING_COMPLETED}
      component={OnboardingCompletedScreen}
    />
    <Stack.Screen
      name={ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES}
      component={OnboardingNotificationsPreferencesScreen}
    />
    <Stack.Group
      screenOptions={{
        gestureEnabled: false,
        headerShown: false,
        presentation: "modal"
      }}
    >
      <Stack.Screen
        name={ROUTES.ONBOARDING_NOTIFICATIONS_INFO_SCREEN_CONSENT}
        component={OnboardingNotificationsInfoScreenConsent}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default OnboardingNavigator;
