import { ItwCredentialStatus } from "../../common/utils/itwTypesUtils";
import { IdentificationContext } from "../../machine/eid/context";

export type KoState = {
  cta_category: "custom_1" | "custom_2";
  cta_id: string;
  reason: unknown;
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
 * ITW_EDIP: Education Diploma (obtained with IT Wallet)
 * ITW_EDAT: Education Attendance (obtained with IT Wallet)
 * UNKNOWN: placeholder used when a credential exists in the app but is not yet tracked on Mixpanel
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used as type
const mixPanelCredentials = [
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
  "ITW_EDIP",
  "ITW_EDAT",
  "UNKNOWN"
] as const;

export type MixPanelCredential = (typeof mixPanelCredentials)[number];

export type NewCredential = MixPanelCredential | OtherMixPanelCredential;

type OtherMixPanelCredential = "CGN" | "payment_method" | "welfare";

/**
 * This map is used to map the credential type to the MixPanel credential
 * Currently, all tracked credentials have both V2 and V3 and new credentials
 */
export const CREDENTIALS_MAP: Record<
  string,
  MixPanelCredential | Record<MixPanelCredentialVersion, MixPanelCredential>
> = {
  pid: { V2: "ITW_ID_V2", V3: "ITW_PID" },
  mDL: { V2: "ITW_PG_V2", V3: "ITW_PG_V3" },
  EuropeanHealthInsuranceCard: { V2: "ITW_TS_V2", V3: "ITW_TS_V3" },
  EuropeanDisabilityCard: { V2: "ITW_CED_V2", V3: "ITW_CED_V3" },
  education_degree: "ITW_ED",
  education_enrollment: "ITW_EE",
  residency: "ITW_RES",
  education_diploma: "ITW_EDIP",
  education_attendance: "ITW_EDAT"
};

export type CredentialStatusAssertionFailure = {
  credential: MixPanelCredential;
  credential_status: string;
  reason?: unknown;
};

export type ItwIdMethod =
  | "cieid_L2"
  | "cieid_L3"
  | IdentificationContext["mode"];

/**
 * Maps an IdentificationContext to the corresponding ItwIdMethod value,
 * distinguishing between CieID L2 and CieID L3 authentication levels.
 */
export const toItwIdMethod = (ctx: IdentificationContext): ItwIdMethod => {
  if (ctx.mode === "cieId") {
    return ctx.level === "L3" ? "cieid_L3" : "cieid_L2";
  }
  return ctx.mode;
};

export type ItwCredentialActionPosition = "bottom_sheet" | "screen";

export type ItwCredentialMixpanelStatus =
  | "expired"
  | "expiring"
  | "expiring_verification"
  | "not_available"
  | "not_valid"
  | "unknown"
  | "valid"
  | "verification_expired";

// Assuming that the eID status is the same as the PID status
export type ItwPIDStatus = Extract<
  ItwCredentialMixpanelStatus,
  "expired" | "expiring" | "not_available" | "valid"
>;

export type ItwStatus =
  | "L2"
  | "L2+ (spid_can)"
  | "L3"
  | "L3 (cie_pin)"
  | "L3 (cieid_can)"
  | "L3 (cieid_pin)"
  | "not_active";

export type ItwThirdPartyCredentials = "not_available" | "not_valid" | "valid";

export type ItwWalletListCredential = "not_available" | "not_valid" | "valid";

export type TrackITWalletIDMethodSelected = {
  itw_flow: ItwFlow;
  ITW_ID_method: ItwIdMethod;
};

export type TrackItwBannerProperties = {
  banner_campaign?: string;
  banner_id: string;
  banner_landing: string;
  banner_page: string;
};

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

export type ItwCopyListItem = {
  credential: MixPanelCredential;
  item_copied: string;
};

export type ItwCredentialDetails = {
  [K in MixPanelCredential]?: ItwCredentialMixpanelStatus;
};

export type ItwCredentialInfoDetails = {
  credential: MixPanelCredential;
  credential_screen_type: "detail" | "preview";
};

export type ItwDismissalAction = {
  itw_flow: ItwFlow;
  screen_name: string;
  user_action: string;
};

// TODO: Add reissuing_PID when the L3 PID reissuance flow is ready
export type ItwFlow = "L2" | "L3" | "not_available" | "reissuing_eID";

export type ItwScreenFlowContext = {
  itw_flow: ItwFlow;
  screen_name: string;
};

export type ItwWalletDataShare = {
  credential: MixPanelCredential;
  phase?:
    | "async_continuation"
    | "initial_request"
    | "old_message_request"
    | "request_in_progress";
};

export type TrackItwDeactivation = {
  credential: MixPanelCredential;
  screen_name: string;
};

export type TrackQualtricsSurvey = {
  survey_id: QualtricsSurveyId;
  survey_page: string;
};

export type TrackSaveCredentialSuccess = {
  credential: MixPanelCredential;
  credential_details: ItwCredentialDetails;
  ITW_ID_method?: ItwIdMethod;
};

export type TrackStartCredentialUpgradeProperties = {
  credential_status: ItwCredentialMixpanelStatus;
  position: ItwCredentialActionPosition;
};

type QualtricsSurveyId =
  | "confirm_eid_flow_exit"
  | "confirm_eid_flow_success"
  | "itw_credential_exit"
  | "itw_eid_activation_exit";
