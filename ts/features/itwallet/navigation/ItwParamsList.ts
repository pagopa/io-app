import { CieCardReaderScreenNavigationParams } from "../identification/screens/cie/ItwCieCardReaderScreen";
import { CieConsentDataUsageScreenNavigationParams } from "../identification/screens/cie/ItwCieConsentDataUsageScreen";
import { CieWrongCiePinScreenNavigationParams } from "../identification/screens/cie/ItwCieWrongCiePinScreen";
import { ITW_ROUTES } from "./routes";

export type ItwParamsList = {
  // DISCOVERY
  [ITW_ROUTES.DISCOVERY.INFO]: undefined;
  // IDENTIFICATION
  [ITW_ROUTES.IDENTIFICATION.MODE_SELECTION]: undefined;
  [ITW_ROUTES.IDENTIFICATION.NFC_INSTRUCTIONS]: undefined;
  [ITW_ROUTES.IDENTIFICATION.IDP_SELECTION]: undefined;
  // ISSUANCE
  [ITW_ROUTES.ISSUANCE.EID_PREVIEW]: undefined;
  [ITW_ROUTES.ISSUANCE.CREDENTIAL_AUTH]: undefined;
  [ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW]: undefined;
  [ITW_ROUTES.ISSUANCE.RESULT]: undefined;
  [ITW_ROUTES.ISSUANCE.EID_CIE.PIN_SCREEN]: undefined;
  [ITW_ROUTES.ISSUANCE.EID_CIE
    .CARD_READER_SCREEN]: CieCardReaderScreenNavigationParams;
  [ITW_ROUTES.ISSUANCE.EID_CIE
    .CONSENT_DATA_USAGE]: CieConsentDataUsageScreenNavigationParams;
  [ITW_ROUTES.ISSUANCE.EID_CIE.WRONG_PIN]: CieWrongCiePinScreenNavigationParams;
  [ITW_ROUTES.ISSUANCE.EID_CIE.WRONG_CARD]: undefined;
  [ITW_ROUTES.ISSUANCE.EID_CIE.UNEXPECTED_ERROR]: undefined;
  [ITW_ROUTES.ISSUANCE.EID_CIE
    .ACTIVATE_NFC]: CieCardReaderScreenNavigationParams;
  // PRESENTATION
  [ITW_ROUTES.PRESENTATION.EID_DETAIL]: undefined;
};
