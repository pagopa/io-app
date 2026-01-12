import { ItwDiscoveryInfoScreenNavigationParams } from "../discovery/screens/ItwDiscoveryInfoScreen";
import { ItwCieInternalAuthAndMrtdScreenParams } from "../identification/cie/screens/ItwCieInternalAuthAndMrtdScreen.tsx";
import { ItwIdentificationCieWarningScreenNavigationParams } from "../identification/cie/screens/ItwIdentificationCieWarningScreen.tsx";
import { ItwIdentificationNavigationParams } from "../identification/common/screens/ItwIdentificationModeSelectionScreen.tsx";
import { ItwIssuanceCredentialTrustIssuerNavigationParams } from "../issuance/screens/ItwIssuanceCredentialTrustIssuerScreen";
import { ItwPlaygroundParamsList } from "../playgrounds/navigation/ItwPlaygroundParamsList.ts";
import { ItwPresentationCredentialAttachmentNavigationParams } from "../presentation/details/screens/ItwPresentationCredentialAttachmentScreen";
import { ItwPresentationCredentialCardModalNavigationParams } from "../presentation/details/screens/ItwPresentationCredentialCardModal";
import { ItwPresentationCredentialDetailNavigationParams } from "../presentation/details/screens/ItwPresentationCredentialDetailScreen";
import { ItwProximityParamsList } from "../presentation/proximity/navigation/ItwProximityParamsList.ts";
import { ItwCredentialTrustmarkScreenNavigationParams } from "../trustmark/screens/ItwCredentialTrustmarkScreen";
import { ITW_ROUTES } from "./routes";

export type ItwParamsList = {
  [ITW_ROUTES.ONBOARDING]: undefined;
  // OFFLINE WALLET
  [ITW_ROUTES.OFFLINE.WALLET]: undefined;
  // DISCOVERY
  [ITW_ROUTES.DISCOVERY.INFO]:
    | ItwDiscoveryInfoScreenNavigationParams
    | undefined;
  [ITW_ROUTES.DISCOVERY.IPZS_PRIVACY]: undefined;
  [ITW_ROUTES.DISCOVERY.ALREADY_ACTIVE_SCREEN]: undefined;
  // IDENTIFICATION
  [ITW_ROUTES.IDENTIFICATION.MODE_SELECTION]: ItwIdentificationNavigationParams;
  // IDENTIFICATION ERRORS
  [ITW_ROUTES.IDENTIFICATION
    .CIE_WARNING]: ItwIdentificationCieWarningScreenNavigationParams;
  // IDENTIFICATION SPID
  [ITW_ROUTES.IDENTIFICATION.IDP_SELECTION]: undefined;
  [ITW_ROUTES.IDENTIFICATION.SPID.LOGIN]: undefined;
  [ITW_ROUTES.IDENTIFICATION.CIE_ID.LOGIN]: undefined;
  // IDENTIFICATION CIE + PIN
  [ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.PIN_SCREEN]: undefined;
  [ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.NFC_SCREEN]: undefined;
  [ITW_ROUTES.IDENTIFICATION.CIE.PIN_SCREEN]: undefined;
  [ITW_ROUTES.IDENTIFICATION.CIE.ACTIVATE_NFC]: undefined;
  [ITW_ROUTES.IDENTIFICATION.CIE.AUTH_SCREEN]: undefined;
  [ITW_ROUTES.IDENTIFICATION.CIE
    .INTERNAL_AUTH_MRTD_SCREEN]: ItwCieInternalAuthAndMrtdScreenParams;
  // IDENTIFICATION L2+
  [ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.CAN_SCREEN]: undefined;
  [ITW_ROUTES.IDENTIFICATION.CIE.PREPARATION.CARD_SCREEN]: undefined;
  [ITW_ROUTES.IDENTIFICATION.CIE.CAN_SCREEN]: undefined;
  // ISSUANCE
  [ITW_ROUTES.ISSUANCE.EID_PREVIEW]: undefined;
  [ITW_ROUTES.ISSUANCE.EID_RESULT]: undefined;
  [ITW_ROUTES.ISSUANCE.EID_FAILURE]: undefined;
  [ITW_ROUTES.ISSUANCE.CREDENTIAL_INTRODUCTION]: undefined;
  [ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER]:
    | ItwIssuanceCredentialTrustIssuerNavigationParams
    | undefined;
  [ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW]: undefined;
  [ITW_ROUTES.ISSUANCE.CREDENTIAL_FAILURE]: undefined;
  [ITW_ROUTES.ISSUANCE.UPCOMING_CREDENTIAL]: undefined;
  [ITW_ROUTES.ISSUANCE.UPGRADE_CREDENTIALS]: undefined;
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
  [ITW_ROUTES.PRESENTATION.PID_DETAIL]: undefined;
  // LANDING SCREENS
  [ITW_ROUTES.LANDING.CREDENTIAL_ASYNC_FLOW_CONTINUATION]: undefined;
  [ITW_ROUTES.LANDING.EID_REISSUANCE]: undefined;
  // OTHERS
  [ITW_ROUTES.IDENTITY_NOT_MATCHING_SCREEN]: undefined;
  [ITW_ROUTES.WALLET_REVOCATION_SCREEN]: undefined;
  [ITW_ROUTES.SETTINGS]: undefined;
} & ItwProximityParamsList &
  ItwPlaygroundParamsList;
