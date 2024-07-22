import { ItwPresentationCredentialDetailNavigationParams } from "../presentation/screens/ItwPresentationCredentialDetailScreen";
import { ITW_ROUTES } from "./routes";

export type ItwParamsList = {
  [ITW_ROUTES.ONBOARDING]: undefined;
  // DISCOVERY
  [ITW_ROUTES.DISCOVERY.INFO]: undefined;
  // IDENTIFICATION
  [ITW_ROUTES.IDENTIFICATION.MODE_SELECTION]: undefined;
  [ITW_ROUTES.IDENTIFICATION.NFC_INSTRUCTIONS]: undefined;
  [ITW_ROUTES.IDENTIFICATION.IDP_SELECTION]: undefined;
  // ISSUANCE
  [ITW_ROUTES.ISSUANCE.EID_REQUEST]: undefined;
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
};
