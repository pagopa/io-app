import { OnboardingNotificationsPreferencesScreenNavigationParams } from "../../../pushNotifications/screens/OnboardingNotificationsPreferencesScreen";
import { OnboardingServicesPreferenceScreenNavigationParams } from "../../screens/OnboardingServicesPreferenceScreen";
import { EmailInsertScreenNavigationParams } from "../../../settings/userData/shared/screens/EmailInsertScreen";
import { SendEmailValidationScreenProp } from "../../../settings/userData/shared/screens/EmailValidationSendEmailScreen";
import ROUTES from "../../../../navigation/routes";

export type OnboardingParamsList = {
  [ROUTES.ONBOARDING_SHARE_DATA]: undefined;
  [ROUTES.ONBOARDING_SERVICES_PREFERENCE]: OnboardingServicesPreferenceScreenNavigationParams;
  [ROUTES.ONBOARDING_SERVICES_PREFERENCE_COMPLETE]: undefined;
  [ROUTES.ONBOARDING_TOS]: undefined;
  [ROUTES.ONBOARDING_PIN]: undefined;
  [ROUTES.ONBOARDING_MISSING_DEVICE_PIN]: undefined;
  [ROUTES.ONBOARDING_MISSING_DEVICE_BIOMETRIC]: undefined;
  [ROUTES.ONBOARDING_FINGERPRINT]: undefined;
  [ROUTES.ONBOARDING_INSERT_EMAIL_SCREEN]: EmailInsertScreenNavigationParams;
  [ROUTES.ONBOARDING_EMAIL_VERIFICATION_SCREEN]: SendEmailValidationScreenProp;
  [ROUTES.ONBOARDING_COMPLETED]: undefined;
  [ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES]: OnboardingNotificationsPreferencesScreenNavigationParams;
  [ROUTES.ONBOARDING_NOTIFICATIONS_INFO_SCREEN_CONSENT]: undefined;
};
