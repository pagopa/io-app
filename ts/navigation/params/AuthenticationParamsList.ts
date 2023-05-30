import { CieCardReaderScreenNavigationParams } from "../../screens/authentication/cie/CieCardReaderScreen";
import { CieConsentDataUsageScreenNavigationParams } from "../../screens/authentication/cie/CieConsentDataUsageScreen";
import { CieWrongCiePinScreenNavigationParams } from "../../screens/authentication/cie/CieWrongCiePinScreen";
import ROUTES from "../routes";

export type AuthenticationParamsList = {
  [ROUTES.AUTHENTICATION_LANDING]: undefined;
  [ROUTES.AUTHENTICATION_IDP_SELECTION]: undefined;
  [ROUTES.AUTHENTICATION_CIE]: undefined;
  [ROUTES.AUTHENTICATION_IDP_LOGIN]: undefined;
  [ROUTES.AUTHENTICATION_IDP_TEST]: undefined;
  [ROUTES.MARKDOWN]: undefined;
  // For expired cie screen
  [ROUTES.CIE_EXPIRED_SCREEN]: undefined;
  [ROUTES.CIE_PIN_SCREEN]: undefined;
  [ROUTES.CIE_AUTHORIZE_USAGE_SCREEN]: undefined;
  [ROUTES.CIE_CARD_READER_SCREEN]: CieCardReaderScreenNavigationParams;
  [ROUTES.CIE_CONSENT_DATA_USAGE]: CieConsentDataUsageScreenNavigationParams;
  [ROUTES.CIE_WRONG_PIN_SCREEN]: CieWrongCiePinScreenNavigationParams;
  [ROUTES.CIE_PIN_TEMP_LOCKED_SCREEN]: undefined;
};
