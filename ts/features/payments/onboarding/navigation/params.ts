import { PaymentsOnboardingFeedbackScreenParams } from "../screens/PaymentsOnboardingFeedbackScreen";
import { PaymentsOnboardingRoutes } from "./routes";

export type PaymentsOnboardingParamsList = {
  [PaymentsOnboardingRoutes.PAYMENTS_ONBOARDING_NAVIGATOR]: undefined;
  [PaymentsOnboardingRoutes.PAYMENTS_ONBOARDING_RESULT_FEEDBACK]: PaymentsOnboardingFeedbackScreenParams;
  [PaymentsOnboardingRoutes.PAYMENTS_ONBOARDING_SELECT_METHOD]: undefined;
};
