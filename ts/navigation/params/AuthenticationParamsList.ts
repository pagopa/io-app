import { CieIdNotInstalledProps } from "../../features/cie/components/CieIdNotInstalled";
import { CieIdLoginProps } from "../../features/cieLogin/components/CieIdLoginWebView";
import { UrlNotCompliant } from "../../features/cieLogin/components/screens/CieIdAuthUrlError";
import { AuthErrorScreenProps } from "../../features/authentication/screens/AuthErrorScreen";
import { CieCardReaderScreenNavigationParams } from "../../features/authentication/screens/cie/CieCardReaderScreen";
import { CieConsentDataUsageScreenNavigationParams } from "../../features/authentication/screens/cie/CieConsentDataUsageScreen";
import { CieWrongCiePinScreenNavigationParams } from "../../features/authentication/screens/cie/CieWrongCiePinScreen";
import { ChosenIdentifier } from "../../features/authentication/screens/OptInScreen";
import { UnlockAccessProps } from "../../features/authentication/screens/UnlockAccessComponent";
import ROUTES from "../routes";

export type AuthenticationParamsList = {
  [ROUTES.AUTHENTICATION_LANDING]: undefined;
  [ROUTES.AUTHENTICATION_ROOTED_DEVICE]: undefined;
  [ROUTES.AUTHENTICATION_OPT_IN]: ChosenIdentifier;
  [ROUTES.AUTHENTICATION_IDP_SELECTION]: undefined;
  [ROUTES.AUTHENTICATION_IDP_LOGIN]: undefined;
  [ROUTES.AUTHENTICATION_AUTH_SESSION]: undefined;
  [ROUTES.AUTHENTICATION_IDP_TEST]: undefined;
  [ROUTES.CIE_ACTIVATE_NFC_SCREEN]: CieCardReaderScreenNavigationParams;
  [ROUTES.AUTH_ERROR_SCREEN]: AuthErrorScreenProps;
  [ROUTES.UNLOCK_ACCESS_SCREEN]: UnlockAccessProps;
  [ROUTES.AUTHENTICATION_CIE_ID_LOGIN]: CieIdLoginProps;
  [ROUTES.CIE_NOT_INSTALLED]: CieIdNotInstalledProps;
  // For expired cie screen
  [ROUTES.CIE_EXPIRED_SCREEN]: undefined;
  [ROUTES.CIE_PIN_SCREEN]: undefined;
  [ROUTES.CIE_LOGIN_CONFIG_SCREEN]: undefined;
  [ROUTES.CIE_CARD_READER_SCREEN]: CieCardReaderScreenNavigationParams;
  [ROUTES.CIE_CONSENT_DATA_USAGE]: CieConsentDataUsageScreenNavigationParams;
  [ROUTES.CIE_WRONG_PIN_SCREEN]: CieWrongCiePinScreenNavigationParams;
  [ROUTES.CIE_UNEXPECTED_ERROR]: undefined;
  [ROUTES.CIE_EXTENDED_APDU_NOT_SUPPORTED_SCREEN]: undefined;
  [ROUTES.CIE_WRONG_CARD_SCREEN]: undefined;
  // Cie wizard screens
  [ROUTES.AUTHENTICATION_CIE_ID_WIZARD]: undefined;
  [ROUTES.AUTHENTICATION_CIE_PIN_WIZARD]: undefined;
  [ROUTES.AUTHENTICATION_SPID_WIZARD]: undefined;
  [ROUTES.AUTHENTICATION_ID_ACTIVATION_WIZARD]: undefined;
  // CieID sign in Error
  [ROUTES.AUTHENTICATION_CIE_ID_ERROR]: undefined;
  [ROUTES.AUTHENTICATION_CIE_ID_INCORRECT_URL]: UrlNotCompliant;
};
