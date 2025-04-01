import { CieIdNotInstalledProps } from "../../../login/cie/components/CieIdNotInstalled";
import { CieIdLoginProps } from "../../../login/cie/components/CieIdLoginWebView";
import { UrlNotCompliant } from "../../../login/cie/screens/CieIdAuthUrlError";
import { AuthErrorScreenProps } from "../../../login/authError/screens/AuthErrorScreen";
import { CieCardReaderScreenNavigationParams } from "../../../login/cie/screens/CieCardReaderScreen";
import { CieConsentDataUsageScreenNavigationParams } from "../../../login/cie/screens/CieConsentDataUsageScreen";
import { CieWrongCiePinScreenNavigationParams } from "../../../login/cie/screens/CieWrongCiePinScreen";
import { ChosenIdentifier } from "../../../login/optIn/screens/OptInScreen";
import { UnlockAccessProps } from "../../../login/unlockAccess/components/UnlockAccessComponent";
import { AUTHENTICATION_ROUTES } from "../routes";

export type AuthenticationParamsList = {
  [AUTHENTICATION_ROUTES.LANDING]: undefined;
  [AUTHENTICATION_ROUTES.ROOTED_DEVICE]: undefined;
  [AUTHENTICATION_ROUTES.OPT_IN]: ChosenIdentifier;
  [AUTHENTICATION_ROUTES.IDP_SELECTION]: undefined;
  [AUTHENTICATION_ROUTES.IDP_LOGIN]: undefined;
  [AUTHENTICATION_ROUTES.AUTH_SESSION]: undefined;
  [AUTHENTICATION_ROUTES.IDP_TEST]: undefined;
  [AUTHENTICATION_ROUTES.CIE_ACTIVATE_NFC_SCREEN]: CieCardReaderScreenNavigationParams;
  [AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN]: AuthErrorScreenProps;
  [AUTHENTICATION_ROUTES.UNLOCK_ACCESS_SCREEN]: UnlockAccessProps;
  [AUTHENTICATION_ROUTES.CIE_ID_LOGIN]: CieIdLoginProps;
  [AUTHENTICATION_ROUTES.CIE_NOT_INSTALLED]: CieIdNotInstalledProps;
  // For expired cie screen
  [AUTHENTICATION_ROUTES.CIE_EXPIRED_SCREEN]: undefined;
  [AUTHENTICATION_ROUTES.CIE_PIN_SCREEN]: undefined;
  [AUTHENTICATION_ROUTES.CIE_LOGIN_CONFIG_SCREEN]: undefined;
  [AUTHENTICATION_ROUTES.CIE_CARD_READER_SCREEN]: CieCardReaderScreenNavigationParams;
  [AUTHENTICATION_ROUTES.CIE_CONSENT_DATA_USAGE]: CieConsentDataUsageScreenNavigationParams;
  [AUTHENTICATION_ROUTES.CIE_WRONG_PIN_SCREEN]: CieWrongCiePinScreenNavigationParams;
  [AUTHENTICATION_ROUTES.CIE_UNEXPECTED_ERROR]: undefined;
  [AUTHENTICATION_ROUTES.CIE_EXTENDED_APDU_NOT_SUPPORTED_SCREEN]: undefined;
  [AUTHENTICATION_ROUTES.CIE_WRONG_CARD_SCREEN]: undefined;
  // Cie wizard screens
  [AUTHENTICATION_ROUTES.CIE_ID_WIZARD]: undefined;
  [AUTHENTICATION_ROUTES.CIE_PIN_WIZARD]: undefined;
  [AUTHENTICATION_ROUTES.SPID_WIZARD]: undefined;
  [AUTHENTICATION_ROUTES.ID_ACTIVATION_WIZARD]: undefined;
  // CieID sign in Error
  [AUTHENTICATION_ROUTES.CIE_ID_ERROR]: undefined;
  [AUTHENTICATION_ROUTES.CIE_ID_INCORRECT_URL]: UrlNotCompliant;
};
