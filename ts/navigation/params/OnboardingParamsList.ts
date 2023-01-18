import { FingerprintScreenNavigationParams } from "../../screens/onboarding/FingerprintScreen";
import { OnboardingNotificationsPreferencesScreenNavigationParams } from "../../screens/onboarding/OnboardingNotificationsPreferencesScreen";
import { OnboardingServicesPreferenceScreenNavigationParams } from "../../screens/onboarding/OnboardingServicesPreferenceScreen";
import ROUTES from "../routes";

export type OnboardingParamsList = {
  [ROUTES.ONBOARDING_SHARE_DATA]: undefined;
  [ROUTES.ONBOARDING_SERVICES_PREFERENCE]: OnboardingServicesPreferenceScreenNavigationParams;
  [ROUTES.ONBOARDING_SERVICES_PREFERENCE_COMPLETE]: undefined;
  [ROUTES.ONBOARDING_TOS]: undefined;
  [ROUTES.ONBOARDING_PIN]: undefined;
  [ROUTES.ONBOARDING_FINGERPRINT]: FingerprintScreenNavigationParams;
  [ROUTES.ONBOARDING_INSERT_EMAIL_SCREEN]: undefined;
  [ROUTES.ONBOARDING_READ_EMAIL_SCREEN]: undefined;
  [ROUTES.ONBOARDING_COMPLETED]: undefined;
  [ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES]: OnboardingNotificationsPreferencesScreenNavigationParams;
  [ROUTES.ONBOARDING_NOTIFICATIONS_INFO_SCREEN_CONSENT]: undefined;
};
