import { CoBadgeChooseTypeNavigationProps } from "../screens/CoBadgeChooseType";
import WALLET_ONBOARDING_COBADGE_ROUTES from "./routes";

export type PaymentMethodOnboardingCoBadgeParamsList = {
  [WALLET_ONBOARDING_COBADGE_ROUTES.CHOOSE_TYPE]: CoBadgeChooseTypeNavigationProps;
  [WALLET_ONBOARDING_COBADGE_ROUTES.START]: undefined;
  [WALLET_ONBOARDING_COBADGE_ROUTES.SEARCH_AVAILABLE]: undefined;
};
