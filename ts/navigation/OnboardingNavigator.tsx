import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import EmailInsertScreen from "../screens/onboarding/EmailInsertScreen";
import EmailReadScreen from "../screens/onboarding/EmailReadScreen";
import FingerprintScreen from "../screens/onboarding/FingerprintScreen";
import OnboardingCompletedScreen from "../screens/onboarding/OnboardingCompletedScreen";
import OnboardingServicesPreferenceScreen from "../screens/onboarding/OnboardingServicesPreferenceScreen";
import OnboardingShareDataScreen from "../screens/onboarding/OnboardingShareDataScreen";
import PinScreen from "../screens/onboarding/PinScreen";
import ServicePreferenceCompleteScreen from "../screens/onboarding/ServicePreferenceCompleteScreen";
import TosScreen from "../screens/onboarding/TosScreen";
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
    <Stack.Screen name={ROUTES.ONBOARDING_TOS} component={TosScreen} />
    <Stack.Screen name={ROUTES.ONBOARDING_PIN} component={PinScreen} />
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
  </Stack.Navigator>
);
// const navigator = createCompatNavigatorFactory(createStackNavigator)(
//   {
//     [ROUTES.ONBOARDING_SHARE_DATA]: {
//       screen: OnboardingShareDataScreen
//     },
//     [ROUTES.ONBOARDING_SERVICES_PREFERENCE]: {
//       screen: OnboardingServicesPreferenceScreen
//     },
//     [ROUTES.ONBOARDING_SERVICES_PREFERENCE_COMPLETE]: {
//       screen: ServicePreferenceCompleteScreen
//     },
//     [ROUTES.ONBOARDING_TOS]: {
//       screen: TosScreen
//     },
//     [ROUTES.ONBOARDING_PIN]: {
//       screen: PinScreen
//     },
//     [ROUTES.ONBOARDING_FINGERPRINT]: {
//       screen: FingerprintScreen
//     },
//     [ROUTES.INSERT_EMAIL_SCREEN]: {
//       screen: EmailInsertScreen
//     },
//     [ROUTES.READ_EMAIL_SCREEN]: {
//       screen: EmailReadScreen
//     },
//     [ROUTES.ONBOARDING_COMPLETED]: {
//       screen: OnboardingCompletedScreen
//     }
//   },
//   {
//     // Let each screen handle the header and navigation
//     headerMode: "none",
//     defaultNavigationOptions: {
//       gestureEnabled: false
//     }
//   }
// );

export default navigator;
