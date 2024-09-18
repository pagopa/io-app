import { ItwCieWrongCiePinScreenNavigationParams } from "../identification/screens/cie/ItwCieWrongCiePinScreen";
import { ItwPresentationCredentialDetailNavigationParams } from "../presentation/screens/ItwPresentationCredentialDetailScreen";
import { ITW_ROUTES } from "./routes";

export type ItwParamsList = {
  [ITW_ROUTES.ONBOARDING]: undefined;
  // DISCOVERY
  [ITW_ROUTES.DISCOVERY.INFO]: undefined;
  // IDENTIFICATION
  [ITW_ROUTES.IDENTIFICATION.MODE_SELECTION]: undefined;
  [ITW_ROUTES.IDENTIFICATION.IDP_SELECTION]: undefined;
  // IDENTIFICATION CIE + PIN
  [ITW_ROUTES.IDENTIFICATION.CIE.PIN_SCREEN]: undefined;
  [ITW_ROUTES.IDENTIFICATION.CIE.CARD_READER_SCREEN]: undefined;
  [ITW_ROUTES.IDENTIFICATION.CIE
    .WRONG_PIN]: ItwCieWrongCiePinScreenNavigationParams;
  [ITW_ROUTES.IDENTIFICATION.CIE.WRONG_CARD]: undefined;
  [ITW_ROUTES.IDENTIFICATION.CIE.UNEXPECTED_ERROR]: undefined;
  [ITW_ROUTES.IDENTIFICATION.CIE.ACTIVATE_NFC]: undefined;
  [ITW_ROUTES.IDENTIFICATION.CIE.CIE_EXPIRED_SCREEN]: undefined;
  // ISSUANCE
  [ITW_ROUTES.ISSUANCE.EID_PREVIEW]: undefined;
  [ITW_ROUTES.ISSUANCE.EID_RESULT]: undefined;
  [ITW_ROUTES.ISSUANCE.EID_FAILURE]: undefined;
  [ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER]: undefined;
  [ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW]: undefined;
  [ITW_ROUTES.ISSUANCE.CREDENTIAL_FAILURE]: undefined;
  // PRESENTATION
  [ITW_ROUTES.PRESENTATION
    .CREDENTIAL_DETAIL]: ItwPresentationCredentialDetailNavigationParams;
  // PLAYGROUNDS
  [ITW_ROUTES.PLAYGROUNDS]: undefined;
  [ITW_ROUTES.IDENTITY_NOT_MATCHING_SCREEN]: undefined;
};
