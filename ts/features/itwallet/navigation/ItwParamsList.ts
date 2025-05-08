import { ItwIdentificationModeSelectionScreenNavigationParams } from "../identification/screens/ItwIdentificationModeSelectionScreen";
import { ItwCieWrongCiePinScreenNavigationParams } from "../identification/screens/cie/ItwCieWrongCiePinScreen";
import { ItwIssuanceCredentialAsyncContinuationNavigationParams } from "../issuance/screens/ItwIssuanceCredentialAsyncContinuationScreen";
import { ItwIssuanceCredentialTrustIssuerNavigationParams } from "../issuance/screens/ItwIssuanceCredentialTrustIssuerScreen";
import { ItwPresentationCredentialAttachmentNavigationParams } from "../presentation/details/screens/ItwPresentationCredentialAttachmentScreen";
import { ItwPresentationCredentialCardModalNavigationParams } from "../presentation/details/screens/ItwPresentationCredentialCardModal";
import { ItwPresentationCredentialDetailNavigationParams } from "../presentation/details/screens/ItwPresentationCredentialDetailScreen";
import { ItwCredentialTrustmarkScreenNavigationParams } from "../trustmark/screens/ItwCredentialTrustmarkScreen";
import { ITW_ROUTES } from "./routes";
import { ItwCiePreparationScreenNavigationParams } from "../identification/screens/cie/ItwCiePreparationScreen.tsx";

export type ItwParamsList = {
  [ITW_ROUTES.ONBOARDING]: undefined;
  // OFFLINE WALLET
  [ITW_ROUTES.OFFLINE.WALLET]: undefined;
  // DISCOVERY
  [ITW_ROUTES.DISCOVERY.INFO]: undefined;
  [ITW_ROUTES.DISCOVERY.IPZS_PRIVACY]: undefined;
  [ITW_ROUTES.DISCOVERY.ALREADY_ACTIVE_SCREEN]: undefined;
  // IDENTIFICATION
  [ITW_ROUTES.IDENTIFICATION
    .MODE_SELECTION]: ItwIdentificationModeSelectionScreenNavigationParams;
  // IDENTIFICATION SPID
  [ITW_ROUTES.IDENTIFICATION.IDP_SELECTION]: undefined;
  [ITW_ROUTES.IDENTIFICATION.SPID.LOGIN]: undefined;
  [ITW_ROUTES.IDENTIFICATION.CIE_ID.LOGIN]: undefined;
  // IDENTIFICATION CIE + PIN
  [ITW_ROUTES.IDENTIFICATION.CIE
    .PREPARATION_SCREEN]: ItwCiePreparationScreenNavigationParams;
  [ITW_ROUTES.IDENTIFICATION.CIE
    .PIN_PREPARATION_SCREEN]: ItwCiePreparationScreenNavigationParams;
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
  [ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER]:
    | ItwIssuanceCredentialTrustIssuerNavigationParams
    | undefined;
  [ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW]: undefined;
  [ITW_ROUTES.ISSUANCE.CREDENTIAL_FAILURE]: undefined;
  [ITW_ROUTES.ISSUANCE
    .CREDENTIAL_ASYNC_FLOW_CONTINUATION]: ItwIssuanceCredentialAsyncContinuationNavigationParams;
  // PRESENTATION
  [ITW_ROUTES.PRESENTATION
    .CREDENTIAL_DETAIL]: ItwPresentationCredentialDetailNavigationParams;
  [ITW_ROUTES.PRESENTATION
    .CREDENTIAL_ATTACHMENT]: ItwPresentationCredentialAttachmentNavigationParams;
  [ITW_ROUTES.PRESENTATION
    .CREDENTIAL_TRUSTMARK]: ItwCredentialTrustmarkScreenNavigationParams;
  [ITW_ROUTES.PRESENTATION
    .CREDENTIAL_CARD_MODAL]: ItwPresentationCredentialCardModalNavigationParams;
  [ITW_ROUTES.PRESENTATION.CREDENTIAL_FISCAL_CODE_MODAL]: undefined;
  [ITW_ROUTES.PRESENTATION.EID_VERIFICATION_EXPIRED]: undefined;
  // PLAYGROUNDS
  [ITW_ROUTES.PLAYGROUNDS]: undefined;
  [ITW_ROUTES.IDENTITY_NOT_MATCHING_SCREEN]: undefined;
  [ITW_ROUTES.WALLET_REVOCATION_SCREEN]: undefined;
};
