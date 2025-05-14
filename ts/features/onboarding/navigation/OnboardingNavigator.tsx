import { createStackNavigator } from "@react-navigation/stack";
import OnboardingCompletedScreen from "../screens/OnboardingCompletedScreen";
import { OnboardingNotificationsInfoScreenConsent } from "../../pushNotifications/screens/OnboardingNotificationsInfoScreenConsent";
import { OnboardingNotificationsPreferencesScreen } from "../../pushNotifications/screens/OnboardingNotificationsPreferencesScreen";
import OnboardingPinScreen from "../screens/OnboardingPinScreen";
import OnboardingServicesPreferenceScreen from "../screens/OnboardingServicesPreferenceScreen";
import OnboardingShareDataScreen from "../screens/OnboardingShareDataScreen";
import OnboardingTosScreen from "../screens/OnboardingTosScreen";
import ServicePreferenceCompleteScreen from "../screens/ServicePreferenceCompleteScreen";
import FingerprintScreen from "../screens/biometric&securityChecks/FingerprintScreen";
import MissingDeviceBiometricScreen from "../screens/biometric&securityChecks/MissingDeviceBiometricScreen";
import MissingDevicePinScreen from "../screens/biometric&securityChecks/MissingDevicePinScreen";
import { isGestureEnabled } from "../../../utils/navigation";
import EmailValidationSendEmailScreen from "../../settings/userData/shared/screens/EmailValidationSendEmailScreen";
import EmailInsertScreen from "../../settings/userData/shared/screens/EmailInsertScreen";
import ROUTES from "../../../navigation/routes";
import { OnboardingParamsList } from "./params/OnboardingParamsList";

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
