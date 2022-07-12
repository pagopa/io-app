import { FingerprintScreenNavigationParams } from "../../screens/onboarding/FingerprintScreen";
import { OnboardingServicesPreferenceScreenNavigationParams } from "../../screens/onboarding/OnboardingServicesPreferenceScreen";
import ROUTES from "../routes";

export type OnboardingParamsList = {
  [ROUTES.ONBOARDING_SHARE_DATA]: undefined;
  [ROUTES.ONBOARDING_SERVICES_PREFERENCE]: OnboardingServicesPreferenceScreenNavigationParams;
  [ROUTES.ONBOARDING_SERVICES_PREFERENCE_COMPLETE]: undefined;
  [ROUTES.ONBOARDING_TOS]: undefined;
  [ROUTES.ONBOARDING_PIN]: undefined;
  [ROUTES.ONBOARDING_FINGERPRINT]: FingerprintScreenNavigationParams;
  [ROUTES.INSERT_EMAIL_SCREEN]: undefined;
  [ROUTES.READ_EMAIL_SCREEN]: undefined;
};
