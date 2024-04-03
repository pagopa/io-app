import { PaymentsOnboardingFeedbackScreenParams } from "../screens/PaymentsOnboardingFeedbackScreen";
import { PaymentsOnboardingRoutes } from "./routes";

export type PaymentsOnboardingParamsList = {
  [PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_NAVIGATOR]: undefined;
  [PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_RESULT_FEEDBACK]: PaymentsOnboardingFeedbackScreenParams;
  [PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_SELECT_METHOD]: undefined;
};
