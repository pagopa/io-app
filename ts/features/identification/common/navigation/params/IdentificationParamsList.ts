import { CieIdNotInstalledProps } from "../../../login/cie/components/CieIdNotInstalled";
import { CieIdLoginProps } from "../../../login/cie/components/CieIdLoginWebView";
import { UrlNotCompliant } from "../../../login/cie/screens/CieIdAuthUrlError";
import { AuthErrorScreenProps } from "../../../login/authError/screens/AuthErrorScreen";
import { CieCardReaderScreenNavigationParams } from "../../../login/cie/screens/CieCardReaderScreen";
import { CieConsentDataUsageScreenNavigationParams } from "../../../login/cie/screens/CieConsentDataUsageScreen";
import { CieWrongCiePinScreenNavigationParams } from "../../../login/cie/screens/CieWrongCiePinScreen";
import { ChosenIdentifier } from "../../../login/optIn/screens/OptInScreen";
import { UnlockAccessProps } from "../../../login/unlockAccess/components/UnlockAccessComponent";
import { IDENTIFICATION_ROUTES } from "../routes";

export type IdentificationParamsList = {
  [IDENTIFICATION_ROUTES.LANDING]: undefined;
  [IDENTIFICATION_ROUTES.ROOTED_DEVICE]: undefined;
  [IDENTIFICATION_ROUTES.OPT_IN]: ChosenIdentifier;
  [IDENTIFICATION_ROUTES.IDP_SELECTION]: undefined;
  [IDENTIFICATION_ROUTES.IDP_LOGIN]: undefined;
  [IDENTIFICATION_ROUTES.AUTH_SESSION]: undefined;
  [IDENTIFICATION_ROUTES.IDP_TEST]: undefined;
  [IDENTIFICATION_ROUTES.CIE_ACTIVATE_NFC_SCREEN]: CieCardReaderScreenNavigationParams;
  [IDENTIFICATION_ROUTES.AUTH_ERROR_SCREEN]: AuthErrorScreenProps;
  [IDENTIFICATION_ROUTES.UNLOCK_ACCESS_SCREEN]: UnlockAccessProps;
  [IDENTIFICATION_ROUTES.CIE_ID_LOGIN]: CieIdLoginProps;
  [IDENTIFICATION_ROUTES.CIE_NOT_INSTALLED]: CieIdNotInstalledProps;
  // For expired cie screen
  [IDENTIFICATION_ROUTES.CIE_EXPIRED_SCREEN]: undefined;
  [IDENTIFICATION_ROUTES.CIE_PIN_SCREEN]: undefined;
  [IDENTIFICATION_ROUTES.CIE_LOGIN_CONFIG_SCREEN]: undefined;
  [IDENTIFICATION_ROUTES.CIE_CARD_READER_SCREEN]: CieCardReaderScreenNavigationParams;
  [IDENTIFICATION_ROUTES.CIE_CONSENT_DATA_USAGE]: CieConsentDataUsageScreenNavigationParams;
  [IDENTIFICATION_ROUTES.CIE_WRONG_PIN_SCREEN]: CieWrongCiePinScreenNavigationParams;
  [IDENTIFICATION_ROUTES.CIE_UNEXPECTED_ERROR]: undefined;
  [IDENTIFICATION_ROUTES.CIE_EXTENDED_APDU_NOT_SUPPORTED_SCREEN]: undefined;
  [IDENTIFICATION_ROUTES.CIE_WRONG_CARD_SCREEN]: undefined;
  // Cie wizard screens
  [IDENTIFICATION_ROUTES.CIE_ID_WIZARD]: undefined;
  [IDENTIFICATION_ROUTES.CIE_PIN_WIZARD]: undefined;
  [IDENTIFICATION_ROUTES.SPID_WIZARD]: undefined;
  [IDENTIFICATION_ROUTES.ID_ACTIVATION_WIZARD]: undefined;
  // CieID sign in Error
  [IDENTIFICATION_ROUTES.CIE_ID_ERROR]: undefined;
  [IDENTIFICATION_ROUTES.CIE_ID_INCORRECT_URL]: UrlNotCompliant;
};
