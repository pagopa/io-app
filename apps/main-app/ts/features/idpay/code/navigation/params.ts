import { IdPayCodeDisplayRouteParams } from "../screens/IdPayCodeDisplayScreen";
import { IdPayCodeOnboardingRouteParams } from "../screens/IdPayCodeOnboardingScreen";
import { IdPayCodeRoutes } from "./routes";

export type IdPayCodeParamsList = {
  [IdPayCodeRoutes.IDPAY_CODE_ONBOARDING]: IdPayCodeOnboardingRouteParams;
  [IdPayCodeRoutes.IDPAY_CODE_DISPLAY]: IdPayCodeDisplayRouteParams;
  [IdPayCodeRoutes.IDPAY_CODE_RENEW]: undefined;
  [IdPayCodeRoutes.IDPAY_CODE_RESULT]: undefined;
};
