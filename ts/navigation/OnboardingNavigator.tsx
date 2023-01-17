import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import EmailInsertScreen from "../screens/onboarding/EmailInsertScreen";
import EmailReadScreen from "../screens/onboarding/EmailReadScreen";
import FingerprintScreen from "../screens/onboarding/FingerprintScreen";
import OnboardingCompletedScreen from "../screens/onboarding/OnboardingCompletedScreen";
import OnboardingNotificationsInfoScreenConsent from "../screens/onboarding/OnboardingNotificationsInfoScreenConsent";
import OnboardingNotificationsPreferencesScreen from "../screens/onboarding/OnboardingNotificationsPreferencesScreen";
import OnboardingPinScreen from "../screens/onboarding/OnboardingPinScreen";
import OnboardingServicesPreferenceScreen from "../screens/onboarding/OnboardingServicesPreferenceScreen";
import OnboardingShareDataScreen from "../screens/onboarding/OnboardingShareDataScreen";
import OnboardingTosScreen from "../screens/onboarding/OnboardingTosScreen";
import ServicePreferenceCompleteScreen from "../screens/onboarding/ServicePreferenceCompleteScreen";
import { isGestureEnabled } from "../utils/navigation";
import { OnboardingParamsList } from "./params/OnboardingParamsList";
import ROUTES from "./routes";

const Stack = createStackNavigator<OnboardingParamsList>();
/**
 * The onboarding related stack of screens of the application.
 */
const navigator = () => (
  <Stack.Navigator
    initialRouteName={ROUTES.ONBOARDING_SHARE_DATA}
    headerMode={"none"}
    screenOptions={{ gestureEnabled: isGestureEnabled }}
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
      name={ROUTES.ONBOARDING_SERVICES_PREFERENCE_COMPLETE}
      component={ServicePreferenceCompleteScreen}
    />
    <Stack.Screen
      name={ROUTES.ONBOARDING_TOS}
      component={OnboardingTosScreen}
    />
    <Stack.Screen
      name={ROUTES.ONBOARDING_PIN}
      component={OnboardingPinScreen}
    />
    <Stack.Screen
      name={ROUTES.ONBOARDING_FINGERPRINT}
      component={FingerprintScreen}
    />
    <Stack.Screen
      name={ROUTES.INSERT_EMAIL_SCREEN}
      component={EmailInsertScreen}
    />
    <Stack.Screen name={ROUTES.READ_EMAIL_SCREEN} component={EmailReadScreen} />
    <Stack.Screen
      name={ROUTES.ONBOARDING_COMPLETED}
      component={OnboardingCompletedScreen}
    />
    <Stack.Screen
      name={ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES}
      component={OnboardingNotificationsPreferencesScreen}
    />
    <Stack.Screen
      name={ROUTES.ONBOARDING_NOTIFICATIONS_INFO_SCREEN_CONSENT}
      component={OnboardingNotificationsInfoScreenConsent}
    />
  </Stack.Navigator>
);

export default navigator;
