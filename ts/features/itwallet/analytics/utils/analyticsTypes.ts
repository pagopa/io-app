import { ItwCredentialStatus } from "../../common/utils/itwTypesUtils";
import { IdentificationContext } from "../../machine/eid/context";

export type KoState = {
  reason: unknown;
  cta_category: "custom_1" | "custom_2";
  cta_id: string;
};

export type MixPanelCredentialVersion = "V2" | "V3";

/**
 * This is the list of credentials that are tracked in MixPanel
 * ITW_ID_V2: PersonIdentificationData (obtained with Documenti su IO)
 * ITW_PG_V2: mDL
 * ITW_TS_V2: EuropeanHealthInsuranceCard
 * ITW_CED_V2: EuropeanDisabilityCard
 * ITW_PID: PID (obtained with IT Wallet)
 * ITW_PG_V3: mDL (obtained with IT Wallet)
 * ITW_TS_V3: EuropeanHealthInsuranceCard (obtained with IT Wallet)
 * ITW_CED_V3: EuropeanDisabilityCard (obtained with IT Wallet)
 * ITW_ED: ED (obtained with IT Wallet)
 * ITW_EE: EE (obtained with IT Wallet)
 * ITW_RES: Residency (obtained with IT Wallet)
 * UNKNOWN: placeholder used when a credential exists in the app but is not yet tracked on Mixpanel
 */
export const mixPanelCredentials = [
  "ITW_ID_V2",
  "ITW_PG_V2",
  "ITW_TS_V2",
  "ITW_CED_V2",
  "ITW_PID",
  "ITW_PG_V3",
  "ITW_TS_V3",
  "ITW_CED_V3",
  "ITW_ED",
  "ITW_EE",
  "ITW_RES",
  "UNKNOWN"
] as const;

export type MixPanelCredential = (typeof mixPanelCredentials)[number];

export type TrackCredentialDetail = {
  credential: MixPanelCredential; // MixPanelCredential
  credential_status: string; // ItwPg
  credential_type?: "multiple" | "unique";
};

export type TrackCredentialPreview = {
  credential: MixPanelCredential; // MixPanelCredential
  credential_type?: "multiple" | "unique";
};

export type OtherMixPanelCredential = "welfare" | "payment_method" | "CGN";
export type NewCredential = MixPanelCredential | OtherMixPanelCredential;

export type ItwFailureCause = "CredentialIssuer" | "WalletProvider";

/**
 * This map is used to map the credential type to the MixPanel credential
 * Currently, all tracked credentials have both V2 and V3 and new credentials
 */
export const CREDENTIALS_MAP: Record<
  string,
  Record<MixPanelCredentialVersion, MixPanelCredential> | MixPanelCredential
> = {
  PersonIdentificationData: { V2: "ITW_ID_V2", V3: "ITW_PID" },
  mDL: { V2: "ITW_PG_V2", V3: "ITW_PG_V3" },
  EuropeanHealthInsuranceCard: { V2: "ITW_TS_V2", V3: "ITW_TS_V3" },
  EuropeanDisabilityCard: { V2: "ITW_CED_V2", V3: "ITW_CED_V3" },
  education_degree: "ITW_ED",
  education_enrollment: "ITW_EE",
  residency: "ITW_RES"
};

export type BackToWallet = {
  exit_page: string;
  credential: Extract<MixPanelCredential, "ITW_ID_V2">;
};

export type ItwExit = {
  exit_page: string;
  credential: MixPanelCredential;
};

export type AddCredentialFailure = {
  credential: MixPanelCredential;
  reason: unknown;
  type: string;
  caused_by: ItwFailureCause;
};

export type IdRequestFailure = {
  ITW_ID_method: ItwIdMethod;
  reason: unknown;
  type: string;
  caused_by: ItwFailureCause;
  itw_flow: ItwFlow;
};

export type IdUnexpectedFailure = {
  reason: unknown;
  type: string;
  itw_flow: ItwFlow;
};

export type CredentialUnexpectedFailure = {
  credential: MixPanelCredential;
  reason: unknown;
  type: string;
};

export type ItwCredentialReissuingFailedProperties = {
  reason: unknown;
  credential_failed: MixPanelCredential;
  itw_flow: ItwFlow;
  type: string;
};

export type CredentialStatusAssertionFailure = {
  credential: MixPanelCredential;
  credential_status: string;
  reason?: unknown;
};

export type ItwIdMethod = IdentificationContext["mode"];

// PROPERTIES TYPES
export type TrackITWalletBannerClosureProperties = {
  banner_id: string;
  banner_page: string;
  banner_landing: string;
  banner_campaign?: string;
};

export type TrackITWalletIDMethodSelected = {
  ITW_ID_method: "spid" | "ciePin" | "cieId";
  itw_flow: ItwFlow;
};

export type TrackITWalletSpidIDPSelected = { idp: string };

export type TrackItWalletCieCardVerifyFailure = {
  reason: CieCardVerifyFailureReason;
  itw_flow: ItwFlow;
  cie_reading_progress: number;
};

export type TrackItWalletCieCardReadingFailure = {
  reason: CieCardReadingFailureReason;
  itw_flow: ItwFlow;
  cie_reading_progress: number;
};

export type TrackItWalletCieCardReadingUnexpectedFailure = {
  reason: string | undefined;
  cie_reading_progress: number;
};

export type CieCardVerifyFailureReason =
  | "CERTIFICATE_EXPIRED"
  | "CERTIFICATE_REVOKED";

export enum CieCardReadingFailureReason {
  KO = "KO",
  ON_TAG_DISCOVERED_NOT_CIE = "ON_TAG_DISCOVERED_NOT_CIE",
  GENERIC_ERROR = "GENERIC_ERROR",
  APDU_ERROR = "APDU_ERROR",
  START_NFC_ERROR = "START_NFC_ERROR",
  STOP_NFC_ERROR = "STOP_NFC_ERROR",
  NO_INTERNET_CONNECTION = "NO_INTERNET_CONNECTION",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR"
}

export type ItwCredentialMixpanelStatus =
  | "not_available"
  | "valid"
  | "not_valid"
  | "expiring"
  | "expired"
  | "expiring_verification"
  | "verification_expired"
  | "unknown";

export type ItwStatus = "not_active" | "L2" | "L3";
// Assuming that the eID status is the same as the PID status
export type ItwPIDStatus = Extract<
  ItwCredentialMixpanelStatus,
  "not_available" | "valid" | "expiring" | "expired"
>;

/**
 * This map is used to map the credentials status to the MixPanel credential status (not for eID)
 * valid: valid
 * invalid: not_valid
 * expired: expired
 * expiring: expiring
 * jwtExpired: verification_expired
 * jwtExpiring: expiring_verification
 * unknown: unknown
 */
export const CREDENTIAL_STATUS_MAP: Record<
  ItwCredentialStatus,
  ItwCredentialMixpanelStatus
> = {
  valid: "valid",
  invalid: "not_valid",
  expired: "expired",
  expiring: "expiring",
  jwtExpired: "verification_expired",
  jwtExpiring: "expiring_verification",
  unknown: "unknown"
};

export type ItwWalletDataShare = {
  credential: MixPanelCredential;
  phase?:
    | "initial_request"
    | "request_in_progress"
    | "old_message_request"
    | "async_continuation";
};

export type ItwCopyListItem = {
  credential: MixPanelCredential;
  item_copied: string;
};

export type ItwOfflineRicaricaAppIOSource =
  | "bottom_sheet"
  | "banner"
  | "access_expired_screen";

export type ItwCredentialInfoDetails = {
  credential: MixPanelCredential;
  credential_screen_type: "detail" | "preview";
};

/**
 * Actions that can trigger the eID reissuing flow.
 * This type represents the user action that was performed immediately before
 * the eID reissuing process is initiated.
 * Add new values here when implementing additional flows that should start
 * the reissuing procedure.
 */
export enum ItwEidReissuingTrigger {
  ADD_CREDENTIAL = "add_credential"
}

/**
 * Actions that trigger the requirement for L3 upgrade.
 * This type represents the user action that was performed immediately before
 * the L3 mandatory upgrade screen was displayed.
 * Add new values when implementing additional flows that require L3 upgrade.
 */
export enum ItwL3UpgradeTrigger {
  REMOTE_QR_CODE = "remote_qr_code"
}

// TODO: Add reissuing_PID when the L3 PID reissuance flow is ready
export type ItwFlow = "L2" | "L3" | "reissuing_eID" | "not_available";

export type ItwScreenFlowContext = {
  screen_name: string;
  itw_flow: ItwFlow;
};

export type ItwDismissalAction = {
  screen_name: string;
  itw_flow: ItwFlow;
  user_action: string;
};

export type ItwUserWithoutL3requirements = {
  screen_name: string;
  reason: "user_without_cie" | "user_without_pin";
  position: "screen" | "bottom_sheet";
};

export type QualtricsSurveyId =
  | "confirm_eid_flow_success"
  | "confirm_eid_flow_exit";

export type TrackQualtricsSurvey = {
  survey_id: QualtricsSurveyId;
  survey_page: string;
};
