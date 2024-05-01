import { IdPayDiscountInstrumentsScreenRouteParams } from "../screens/IdPayDiscountInstrumentsScreen";
import { ConfigurationMode } from "../types";
import { IdPayConfigurationRoutes } from "./routes";

export type IdPayConfigurationNavigatorParams = {
  initiativeId: string;
  mode?: ConfigurationMode;
};

export type IdPayConfigurationParamsList = {
  [IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR]: IdPayConfigurationNavigatorParams;
  [IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO]: undefined;
  [IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_LANDING]: undefined;
  [IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ONBOARDING]: undefined;
  [IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT]: undefined;
  [IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT]: undefined;
  [IdPayConfigurationRoutes.IDPAY_CONFIGURATION_DISCOUNT_INSTRUMENTS]: IdPayDiscountInstrumentsScreenRouteParams;
  [IdPayConfigurationRoutes.IDPAY_CONFIGURATION_SUCCESS]: undefined;
};
