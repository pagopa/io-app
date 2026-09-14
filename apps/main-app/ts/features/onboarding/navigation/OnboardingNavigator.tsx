import { createStackNavigator } from "@react-navigation/stack";

import ROUTES from "../../../navigation/routes";
import { isGestureEnabled } from "../../../utils/navigation";
import { OnboardingNotificationsInfoScreenConsent } from "../../pushNotifications/screens/OnboardingNotificationsInfoScreenConsent";
import { OnboardingNotificationsPreferencesScreen } from "../../pushNotifications/screens/OnboardingNotificationsPreferencesScreen";
import EmailInsertScreen from "../../settings/userData/shared/screens/EmailInsertScreen";
import EmailValidationSendEmailScreen from "../../settings/userData/shared/screens/EmailValidationSendEmailScreen";
import FingerprintScreen from "../screens/biometric&securityChecks/FingerprintScreen";
import MissingDeviceBiometricScreen from "../screens/biometric&securityChecks/MissingDeviceBiometricScreen";
import MissingDevicePinScreen from "../screens/biometric&securityChecks/MissingDevicePinScreen";
import OnboardingCompletedScreen from "../screens/OnboardingCompletedScreen";
import OnboardingPinScreen from "../screens/OnboardingPinScreen";
import OnboardingServicesPreferenceScreen from "../screens/OnboardingServicesPreferenceScreen";
import OnboardingShareDataScreen from "../screens/OnboardingShareDataScreen";
import OnboardingTosScreen from "../screens/OnboardingTosScreen";
import ServicePreferenceCompleteScreen from "../screens/ServicePreferenceCompleteScreen";
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
      component={OnboardingShareDataScreen}
      name={ROUTES.ONBOARDING_SHARE_DATA}
    />
    <Stack.Screen
      component={OnboardingServicesPreferenceScreen}
      name={ROUTES.ONBOARDING_SERVICES_PREFERENCE}
    />
    <Stack.Screen
      component={ServicePreferenceCompleteScreen}
      name={ROUTES.ONBOARDING_SERVICES_PREFERENCE_COMPLETE}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      component={OnboardingTosScreen}
      name={ROUTES.ONBOARDING_TOS}
      options={{ headerShown: true }}
    />
    <Stack.Screen
      component={OnboardingPinScreen}
      name={ROUTES.ONBOARDING_PIN}
    />
    <Stack.Screen
      component={FingerprintScreen}
      name={ROUTES.ONBOARDING_FINGERPRINT}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      component={MissingDevicePinScreen}
      name={ROUTES.ONBOARDING_MISSING_DEVICE_PIN}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      component={MissingDeviceBiometricScreen}
      name={ROUTES.ONBOARDING_MISSING_DEVICE_BIOMETRIC}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      component={EmailInsertScreen}
      name={ROUTES.ONBOARDING_INSERT_EMAIL_SCREEN}
      options={{ gestureEnabled: false }}
    />

    <Stack.Screen
      component={EmailValidationSendEmailScreen}
      name={ROUTES.ONBOARDING_EMAIL_VERIFICATION_SCREEN}
      options={{ gestureEnabled: false, headerShown: false }}
    />
    <Stack.Screen
      component={OnboardingCompletedScreen}
      name={ROUTES.ONBOARDING_COMPLETED}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      component={OnboardingNotificationsPreferencesScreen}
      name={ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES}
    />
    <Stack.Group
      screenOptions={{
        gestureEnabled: false,
        headerShown: false,
        presentation: "modal"
      }}
    >
      <Stack.Screen
        component={OnboardingNotificationsInfoScreenConsent}
        name={ROUTES.ONBOARDING_NOTIFICATIONS_INFO_SCREEN_CONSENT}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default OnboardingNavigator;
