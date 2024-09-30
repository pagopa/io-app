import { IdPayIbanEnrollmentScreenParams } from "../screens/IbanEnrollmentScreen";
import { IdPayDiscountInstrumentsScreenRouteParams } from "../screens/IdPayDiscountInstrumentsScreen";
import { IdPayInitiativeConfigurationIntroScreenParams } from "../screens/InitiativeConfigurationIntroScreen";
import { IdPayInstrumentsEnrollmentScreenParams } from "../screens/InstrumentsEnrollmentScreen";
import { IdPayConfigurationRoutes } from "./routes";

export type IdPayConfigurationParamsList = {
  [IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO]: IdPayInitiativeConfigurationIntroScreenParams;
  [IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_LANDING]: undefined;
  [IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ONBOARDING]: undefined;
  [IdPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT]: IdPayIbanEnrollmentScreenParams;
  [IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT]: IdPayInstrumentsEnrollmentScreenParams;
  [IdPayConfigurationRoutes.IDPAY_CONFIGURATION_DISCOUNT_INSTRUMENTS]: IdPayDiscountInstrumentsScreenRouteParams;
  [IdPayConfigurationRoutes.IDPAY_CONFIGURATION_SUCCESS]: undefined;
};
