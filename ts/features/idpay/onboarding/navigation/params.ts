import { InitiativeDetailsScreenParams } from "../screens/InitiativeDetailsScreen";
import { IdPayOnboardingRoutes } from "./routes";

export type IdPayOnboardingParamsList = {
  [IdPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS]: InitiativeDetailsScreenParams;
  [IdPayOnboardingRoutes.IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS]: undefined;
  [IdPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE]: undefined;
  [IdPayOnboardingRoutes.IDPAY_ONBOARDING_COMPLETION]: undefined;
  [IdPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE]: undefined;
  [IdPayOnboardingRoutes.IDPAY_ONBOARDING_MULTI_SELF_DECLARATIONS]: undefined;
  [IdPayOnboardingRoutes.IDPAY_ONBOARDING_INPUT_FORM]: undefined;
};
