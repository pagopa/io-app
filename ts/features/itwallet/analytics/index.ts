import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { getType } from "typesafe-actions";
import { mixpanelTrack } from "../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../mixpanelConfig/profileProperties";
import { updateMixpanelSuperProperties } from "../../../mixpanelConfig/superProperties";
import { Action } from "../../../store/actions/types.ts";
import { GlobalState } from "../../../store/reducers/types";
import { buildEventProperties } from "../../../utils/analytics";
import {
  resetOfflineAccessReason,
  setOfflineAccessReason
} from "../../ingress/store/actions";
import { itwAuthLevelSelector } from "../common/store/selectors/preferences.ts";
import { getCredentialStatus } from "../common/utils/itwCredentialStatusUtils";
import { isItwCredential } from "../common/utils/itwCredentialUtils";
import { CredentialType } from "../common/utils/itwMocksUtils";
import {
  ItwCredentialStatus,
  ItwJwtCredentialStatus,
  WalletInstanceRevocationReason
} from "../common/utils/itwTypesUtils";
import {
  itwCredentialsEidStatusSelector,
  itwCredentialsSelector
} from "../credentials/store/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../lifecycle/store/selectors";
import { IdentificationContext } from "../machine/eid/context";
import { IssuanceFailure } from "../machine/eid/failure";
import {
  ITW_ACTIONS_EVENTS,
  ITW_CONFIRM_EVENTS,
  ITW_ERRORS_EVENTS,
  ITW_EXIT_EVENTS,
  ITW_SCREENVIEW_EVENTS,
  ITW_TECH_EVENTS
} from "./enum";

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

// Exclude ITW_ED, ITW_EE, ITW_RES and UNKNOWN from MixPanelCredentialProperty since are not used in tracking properties/super properties
type MixPanelCredentialProperty = Exclude<
  MixPanelCredential,
  "ITW_ED" | "ITW_EE" | "ITW_RES" | "UNKNOWN"
>;

// Type guard to exclude ITW_ED, ITW_EE, ITW_RES and UNKNOWN from MixPanelCredential
const isMixPanelCredentialProperty = (
  c: MixPanelCredential
): c is MixPanelCredentialProperty =>
  c !== "ITW_ED" && c !== "ITW_EE" && c !== "ITW_RES" && c !== "UNKNOWN";

export type MixPanelCredential = (typeof mixPanelCredentials)[number];

type TrackCredentialDetail = {
  credential: MixPanelCredential; // MixPanelCredential
  credential_status: string; // ItwPg
  credential_type?: "multiple" | "unique";
};

type TrackCredentialPreview = {
  credential: MixPanelCredential; // MixPanelCredential
  credential_type?: "multiple" | "unique";
};

export type OtherMixPanelCredential = "welfare" | "payment_method" | "CGN";
type NewCredential = MixPanelCredential | OtherMixPanelCredential;

type ItwFailureCause = "CredentialIssuer" | "WalletProvider";

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

type BackToWallet = {
  exit_page: string;
  credential: Extract<MixPanelCredential, "ITW_ID_V2">;
};

type ItwExit = {
  exit_page: string;
  credential: MixPanelCredential;
};

type AddCredentialFailure = {
  credential: MixPanelCredential;
  reason: unknown;
  type: string;
  caused_by: ItwFailureCause;
};

type IdRequestFailure = {
  ITW_ID_method: ItwIdMethod;
  reason: unknown;
  type: string;
  caused_by: ItwFailureCause;
};

type IdUnexpectedFailure = {
  reason: unknown;
  type: string;
};

type CredentialUnexpectedFailure = {
  credential: MixPanelCredential;
  reason: unknown;
  type: string;
};

type ItwCredentialReissuingFailedProperties = {
  reason: unknown;
  credential_failed: MixPanelCredential;
  itw_flow: ItwFlow;
  type: string;
};

type CredentialStatusAssertionFailure = {
  credential: MixPanelCredential;
  credential_status: string;
  reason?: unknown;
};

type ItwIdMethod = IdentificationContext["mode"];

// PROPERTIES TYPES
type TrackITWalletBannerClosureProperties = {
  banner_id: string;
  banner_page: string;
  banner_landing: string;
  banner_campaign?: string;
};

type TrackITWalletIDMethodSelected = {
  ITW_ID_method: ItwIdMethod;
  itw_flow: ItwFlow;
};

type TrackITWalletSpidIDPSelected = {
  idp: string;
  itw_flow: ItwFlow;
};

type TrackItWalletCieCardVerifyFailure = {
  reason: CieCardVerifyFailureReason;
  itw_flow: ItwFlow;
  cie_reading_progress: number;
};

type TrackItWalletCieCardReadingFailure = {
  reason: CieCardReadingFailureReason;
  itw_flow: ItwFlow;
  cie_reading_progress: number;
};

type TrackItWalletCieCardReadingUnexpectedFailure = {
  reason: string | undefined;
  cie_reading_progress: number;
};

type TrackGetChallengeInfoFailure = {
  ITW_ID_method: Exclude<ItwIdMethod, "ciePin">;
  reason?: string;
};

type TrackCieCanProperties = {
  ITW_ID_method?: ItwIdMethod;
};

type TrackCieScreenProperties = {
  itw_flow: ItwFlow;
  ITW_ID_method?: ItwIdMethod;
};

type TrackItWalletCardReadingClose = {
  cie_reading_progress: number;
} & TrackCieScreenProperties;

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

type ItwWalletDataShare = {
  credential: MixPanelCredential;
  phase?:
    | "initial_request"
    | "request_in_progress"
    | "old_message_request"
    | "async_continuation";
};

type ItwCopyListItem = {
  credential: MixPanelCredential;
  item_copied: string;
};

export type ItwOfflineRicaricaAppIOSource =
  | "bottom_sheet"
  | "banner"
  | "access_expired_screen";

type ItwCredentialInfoDetails = {
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

type ItwUserWithoutL3requirements = {
  screen_name: string;
  reason: "user_without_cie" | "user_without_pin";
  position: "screen" | "bottom_sheet";
};

type QualtricsSurveyId = "confirm_eid_flow_success" | "confirm_eid_flow_exit";

export type TrackQualtricsSurvey = {
  survey_id: QualtricsSurveyId;
  survey_page: string;
};

// #region SCREEN VIEW EVENTS
export const trackWalletDataShare = (properties: ItwWalletDataShare) => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_DATA_SHARE,
    buildEventProperties("UX", "screen_view", properties)
  );
};

export const trackOpenWalletScreen = () => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.WALLET,
    buildEventProperties("UX", "screen_view")
  );
};

export const trackShowCredentialsList = () => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.WALLET_ADD_LIST_ITEM,
    buildEventProperties("UX", "screen_view")
  );
};

export const trackCredentialPreview = (
  credentialPreview: TrackCredentialPreview
) => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_CREDENTIAL_PREVIEW,
    buildEventProperties("UX", "screen_view", credentialPreview)
  );
};

export const trackCredentialDetail = (
  credentialDetails: TrackCredentialDetail
) => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_CREDENTIAL_DETAIL,
    buildEventProperties("UX", "screen_view", credentialDetails)
  );
};

export function trackITWalletBannerVisualized(
  properties: TrackITWalletBannerClosureProperties
) {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.BANNER,
    buildEventProperties("UX", "screen_view", properties)
  );
}

export function trackItWalletIntroScreen(itw_flow: ItwFlow) {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_INTRO,
    buildEventProperties("UX", "screen_view", { itw_flow })
  );
}

export function trackItWalletIDMethod(itw_flow: ItwFlow) {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_ID_METHOD,
    buildEventProperties("UX", "screen_view", { itw_flow })
  );
}

export function trackItWalletSpidIDPSelection(itw_flow: ItwFlow) {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_SPID_IDP_SELECTION,
    buildEventProperties("UX", "screen_view", { itw_flow })
  );
}

export function trackItWalletCiePinEnter(itw_flow: ItwFlow) {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_CIE_PIN_ENTER,
    buildEventProperties("UX", "screen_view", { itw_flow })
  );
}

export function trackItWalletCieNfcActivation(itw_flow: ItwFlow) {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_CIE_NFC_ACTIVATION,
    buildEventProperties("UX", "screen_view", { itw_flow })
  );
}

export function trackItWalletCieCardReading(
  properties: TrackCieScreenProperties
) {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_CIE_CARD_READING,
    buildEventProperties("UX", "screen_view", properties)
  );
}

export function trackItWalletCieCardReadingSuccess(
  properties: TrackCieScreenProperties
) {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_CARD_READING_SUCCESS,
    buildEventProperties("UX", "screen_view", properties)
  );
}

export function trackItWalletDeferredIssuing(credential: MixPanelCredential) {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_DEFERRED_ISSUING,
    buildEventProperties("UX", "screen_view", { credential })
  );
}

export function trackWalletCredentialFAC_SIMILE(
  credential: MixPanelCredential
) {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS["ITW_CREDENTIAL_FAC-SIMILE"],
    buildEventProperties("UX", "screen_view", { credential })
  );
}

export function trackItwOfflineWallet() {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_OFFLINE_WALLET,
    buildEventProperties("UX", "screen_view")
  );
}

export function trackItwOfflineBottomSheet() {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_OFFLINE_BOTTOM_SHEET,
    buildEventProperties("UX", "screen_view")
  );
}

export function trackItwDismissalContext(
  screenFlowContext: ItwScreenFlowContext
) {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_OPERATION_BLOCK,
    buildEventProperties("UX", "screen_view", screenFlowContext)
  );
}

export function trackItwUpgradeBanner(banner_page: string) {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_BANNER,
    buildEventProperties("UX", "screen_view", { banner_page })
  );
}

export function trackItwPinInfoBottomSheet(
  screenFlowContext: ItwScreenFlowContext
) {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_PIN_INFO_BOTTOMSHEET,
    buildEventProperties("UX", "screen_view", screenFlowContext)
  );
}

export function trackItwCieInfoBottomSheet(
  screenFlowContext: ItwScreenFlowContext
) {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_CIE_INFO_BOTTOMSHEET,
    buildEventProperties("UX", "screen_view", screenFlowContext)
  );
}

export function trackItwCiePinTutorialCie(
  properties: TrackCieScreenProperties
) {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_CIE_PIN_TUTORIAL_CIE,
    buildEventProperties("UX", "screen_view", properties)
  );
}

export function trackItwCiePinTutorialPin(itw_flow: ItwFlow) {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_CIE_PIN_TUTORIAL_PIN,
    buildEventProperties("UX", "screen_view", { itw_flow })
  );
}

export function trackItwUserWithoutL3Bottomsheet() {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_USER_WITHOUT_L3_BOTTOMSHEET,
    buildEventProperties("UX", "screen_view")
  );
}
export const trackItwCredentialBottomSheet = (
  properties: TrackCredentialDetail
) => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_CREDENTIAL_BOTTOMSHEET,
    buildEventProperties("UX", "screen_view", properties)
  );
};

export const trackItwCredentialNeedsVerification = (
  credential: MixPanelCredential
) => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_CREDENTIAL_NEEDS_VERIFICATION,
    buildEventProperties("UX", "screen_view", {
      credential,
      credential_status: "verification_expired"
    })
  );
};

export const trackItwOfflineAccessExpiring = () => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_OFFLINE_ACCESS_EXPIRING,
    buildEventProperties("UX", "screen_view")
  );
};

export const trackItwOfflineAccessExpired = () => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_OFFLINE_ACCESS_EXPIRED,
    buildEventProperties("KO", "screen_view")
  );
};

export const trackItwSurveyRequest = (properties: TrackQualtricsSurvey) => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.SURVEY_REQUEST,
    buildEventProperties("UX", "screen_view", properties)
  );
};

export const trackItwIdCieCanTutorialCan = (
  properties: TrackCieCanProperties
) => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_ID_CIE_CAN_TUTORIAL_CAN,
    buildEventProperties("UX", "screen_view", properties)
  );
};

export const trackItwIdEnterCan = (properties: TrackCieCanProperties) => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_ID_ENTER_CAN,
    buildEventProperties("UX", "screen_view", properties)
  );
};

// #endregion SCREEN VIEW EVENTS

// #region ACTIONS

export const trackItwCredentialDelete = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_DELETE,
    buildEventProperties("UX", "action", { credential })
  );
};

export const trackWalletDataShareAccepted = (
  properties: ItwWalletDataShare
) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_DATA_SHARE_ACCEPTED,
    buildEventProperties("UX", "action", properties)
  );
};

export const trackOpenItwTos = () => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_TOS,
    buildEventProperties("UX", "action")
  );
};

export const trackOpenItwTosAccepted = (itw_flow: ItwFlow) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_TOS_ACCEPTED,
    buildEventProperties("UX", "action", { itw_flow })
  );
};

export const trackStartAddNewCredential = (wallet_item: NewCredential) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.WALLET_ADD_START,
    buildEventProperties("UX", "action", {
      wallet_item,
      add_entry_point: "wallet_home",
      payment_home_status: "not_set"
    })
  );
};

export const trackItwKoStateAction = (params: KoState) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_KO_STATE_ACTION_SELECTED,
    buildEventProperties("UX", "action", { ...params })
  );
};

export const trackAddFirstCredential = () => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_ADD_FIRST_CREDENTIAL,
    buildEventProperties("UX", "action")
  );
};

export const trackSaveCredentialToWallet = (credential: MixPanelCredential) => {
  if (credential) {
    void mixpanelTrack(
      ITW_ACTIONS_EVENTS.ITW_UX_CONVERSION,
      buildEventProperties("UX", "action", { credential })
    );
  }
};

export function trackItWalletActivationStart(itw_flow: ItwFlow) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_ID_START,
    buildEventProperties("UX", "action", { itw_flow })
  );
}

export function trackItWalletIDMethodSelected(
  properties: TrackITWalletIDMethodSelected
) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_ID_METHOD_SELECTED,
    buildEventProperties("UX", "action", properties)
  );
}

export function trackItWalletSpidIDPSelected(
  properties: TrackITWalletSpidIDPSelected
) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_SPID_IDP_SELECTED,
    buildEventProperties("UX", "action", properties)
  );
}

export function trackItWalletCiePinInfo(itw_flow: ItwFlow) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CIE_PIN_INFO,
    buildEventProperties("UX", "action", { itw_flow })
  );
}

export function trackItWalletCiePinForgotten(itw_flow: ItwFlow) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CIE_PIN_FORGOTTEN,
    buildEventProperties("UX", "action", { itw_flow })
  );
}

export function trackItWalletCiePukForgotten(itw_flow: ItwFlow) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CIE_PUK_FORGOTTEN,
    buildEventProperties("UX", "action", { itw_flow })
  );
}

export function trackItWalletCieNfcGoToSettings(itw_flow: ItwFlow) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CIE_NFC_GO_TO_SETTINGS,
    buildEventProperties("UX", "action", { itw_flow })
  );
}

export function trackItWalletCieRetryPin(itw_flow: ItwFlow) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CIE_RETRY_PIN,
    buildEventProperties("UX", "action", { itw_flow })
  );
}

export function trackWalletAdd() {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.WALLET_ADD,
    buildEventProperties("UX", "action")
  );
}

export function trackItWalletBannerClosure(
  properties: TrackITWalletBannerClosureProperties
) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.CLOSE_BANNER,
    buildEventProperties("UX", "action", properties)
  );
}

export function trackItWalletBannerTap(
  properties: TrackITWalletBannerClosureProperties
) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.TAP_BANNER,
    buildEventProperties("UX", "action", properties)
  );
}

export function trackWalletCategoryFilter(wallet_category: string) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.WALLET_CATEGORY_FILTER,
    buildEventProperties("UX", "action", { wallet_category })
  );
}

export function trackWalletShowBack(credential: MixPanelCredential) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_SHOW_BACK,
    buildEventProperties("UX", "action", { credential })
  );
}

export function trackWalletCredentialShowIssuer(
  properties: ItwCredentialInfoDetails
) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_SHOW_ISSUER,
    buildEventProperties("UX", "action", properties)
  );
}

export function trackWalletCredentialShowAuthSource(
  properties: ItwCredentialInfoDetails
) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_SHOW_AUTH_SOURCE,
    buildEventProperties("UX", "action", properties)
  );
}
export function trackWalletCredentialSupport(credential: MixPanelCredential) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_SUPPORT,
    buildEventProperties("UX", "action", { credential })
  );
}

export function trackWalletCredentialShowFAC_SIMILE() {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS["ITW_CREDENTIAL_SHOW_FAC-SIMILE"],
    buildEventProperties("UX", "action", { credential: "ITW_TS_V2" })
  );
}

// ITW_CREDENTIAL_SHOW_TRUSTMARK
export function trackWalletCredentialShowTrustmark(
  credential: MixPanelCredential
) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_SHOW_TRUSTMARK,
    buildEventProperties("UX", "action", { credential })
  );
}

export function trackWalletStartDeactivation(credential: MixPanelCredential) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_START_DEACTIVATION,
    buildEventProperties("UX", "action", { credential })
  );
}

export function trackWalletNewIdReset(state: GlobalState) {
  updatePropertiesWalletRevoked(state);
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_NEW_ID_RESET,
    buildEventProperties("UX", "action")
  );
}

export function trackItwIntroBack(itw_flow: ItwFlow) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_INTRO_BACK,
    buildEventProperties("UX", "action", { itw_flow })
  );
}

// TODO: Track credential renewal flow when implemented
export function trackWalletCredentialRenewStart(
  credential: MixPanelCredential
) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_RENEW_START,
    buildEventProperties("UX", "action", { credential })
  );
}

export function trackIssuanceCredentialScrollToBottom(
  credential: MixPanelCredential,
  screenRoute: string
) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_ISSUANCE_CREDENTIAL_SCROLL,
    buildEventProperties("UX", "action", { credential, screen: screenRoute })
  );
}

export function trackCredentialCardModal(credential: MixPanelCredential) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_CARD_MODAL,
    buildEventProperties("UX", "action", {
      credential,
      credential_status: "valid"
    })
  );
}

export function trackItwOfflineRicaricaAppIO(
  source: ItwOfflineRicaricaAppIOSource
) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_OFFLINE_RICARICA_APP_IO,
    buildEventProperties("UX", "action", {
      source
    })
  );
}

export const trackCopyListItem = (properties: ItwCopyListItem) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_COPY_LIST_ITEM,
    buildEventProperties("UX", "action", properties)
  );
};

export const trackItwDismissalAction = (
  dismissalAction: ItwDismissalAction
) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_OPERATION_BLOCK_ACTION,
    buildEventProperties("UX", "action", dismissalAction)
  );
};

export const trackItwTapUpgradeBanner = (banner_page: string) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_TAP_BANNER,
    buildEventProperties("UX", "action", { banner_page })
  );
};

export const trackItwDiscoveryPlus = () => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_DISCOVERY_PLUS,
    buildEventProperties("UX", "action", { itw_flow: "L3" })
  );
};

export const trackItwContinueWithCieID = () => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CONTINUE_WITH_CIEID,
    buildEventProperties("UX", "action", { itw_flow: "L3" })
  );
};

export const trackItwContinueWithCieIDClose = () => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CONTINUE_WITH_CIEID_CLOSE,
    buildEventProperties("UX", "action", { itw_flow: "L3" })
  );
};

export const trackItwGoToCieIDApp = () => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_GO_TO_CIEID_APP,
    buildEventProperties("UX", "action", { itw_flow: "L3" })
  );
};

export const trackItwCredentialTapBanner = (
  properties: TrackCredentialDetail
) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_TAP_BANNER,
    buildEventProperties("UX", "action", properties)
  );
};

export const trackItwCredentialBottomSheetAction = (
  properties: TrackCredentialDetail
) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_BOTTOMSHEET_ACTION,
    buildEventProperties("UX", "action", properties)
  );
};

export function trackItwCredentialQualificationDetail(
  properties: ItwCredentialInfoDetails
) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_QUALIFICATION_DETAIL,
    buildEventProperties("UX", "action", properties)
  );
}

export const trackItwSurveyRequestAccepted = (
  properties: TrackQualtricsSurvey
) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.SURVEY_REQUEST_ACCEPTED,
    buildEventProperties("UX", "action", properties)
  );
};

export const trackItwSurveyRequestDeclined = (
  properties: TrackQualtricsSurvey
) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.SURVEY_REQUEST_DECLINED,
    buildEventProperties("UX", "action", properties)
  );
};

// #endregion ACTIONS

// #region ERRORS

export function trackItWalletErrorCardReading(
  itw_flow: ItwFlow,
  cie_reading_progress: number
) {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_CIE_CARD_READING_ERROR,
    buildEventProperties("UX", "error", { itw_flow, cie_reading_progress })
  );
}

export function trackItWalletErrorPin(
  itw_flow: ItwFlow,
  cie_reading_progress: number
) {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_CIE_PIN_ERROR,
    buildEventProperties("UX", "error", { itw_flow, cie_reading_progress })
  );
}

export function trackItWalletSecondErrorPin(
  itw_flow: ItwFlow,
  cie_reading_progress: number
) {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_CIE_PIN_SECOND_ERROR,
    buildEventProperties("UX", "error", { itw_flow, cie_reading_progress })
  );
}

export function trackItWalletLastErrorPin(
  itw_flow: ItwFlow,
  cie_reading_progress: number
) {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_CIE_PIN_LAST_ERROR,
    buildEventProperties("UX", "error", { itw_flow, cie_reading_progress })
  );
}

export function trackItWalletCardReadingClose(
  properties: TrackItWalletCardReadingClose
) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CIE_CARD_READING_CLOSE,
    buildEventProperties("UX", "error", properties)
  );
}

export function trackItWalletCieCardVerifyFailure(
  properties: TrackItWalletCieCardVerifyFailure
) {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_CIE_CARD_VERIFY_FAILURE,
    buildEventProperties("UX", "error", properties)
  );
}

export function trackItWalletCieCardReadingFailure(
  properties: TrackItWalletCieCardReadingFailure
) {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_CIE_CARD_READING_FAILURE,
    buildEventProperties("UX", "error", properties)
  );
}

export function trackItWalletCieCardReadingUnexpectedFailure(
  properties: TrackItWalletCieCardReadingUnexpectedFailure
) {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_CIE_CARD_READING_UNEXPECTED_FAILURE,
    buildEventProperties("KO", "error", properties)
  );
}

export const trackIdNotMatch = (ITW_ID_method: ItwIdMethod) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_ID_NOT_MATCH,
    buildEventProperties("KO", "error", { ITW_ID_method })
  );
};

// TODO: Track IPZS timeout on eID flow
export const trackItwIdRequestTimeout = (ITW_ID_method?: ItwIdMethod) => {
  if (ITW_ID_method) {
    void mixpanelTrack(
      ITW_ERRORS_EVENTS.ITW_ID_REQUEST_TIMEOUT,
      buildEventProperties("KO", "error", { ITW_ID_method })
    );
  }
};

export const trackItwIdRequestFailure = (properties: IdRequestFailure) => {
  if (properties.ITW_ID_method) {
    void mixpanelTrack(
      ITW_ERRORS_EVENTS.ITW_ID_REQUEST_FAILURE,
      buildEventProperties("KO", "error", properties)
    );
  }
};

export const trackItwUnsupportedDevice = (properties: IssuanceFailure) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_DEVICE_NOT_SUPPORTED,
    buildEventProperties("KO", "error", { reason: properties.reason })
  );
};

export const trackItwIdNotMatch = () => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_LOGIN_ID_NOT_MATCH,
    buildEventProperties("KO", "error")
  );
};

export const trackItwHasAlreadyCredential = (
  properties: TrackCredentialDetail
) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_ALREADY_HAS_CREDENTIAL,
    buildEventProperties("KO", "error", properties)
  );
};

export const trackAddCredentialFailure = ({
  credential,
  reason,
  type
}: AddCredentialFailure) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_ADD_CREDENTIAL_FAILURE,
    buildEventProperties("KO", "error", { credential, reason, type })
  );
};

export const trackAddCredentialUnexpectedFailure = ({
  credential,
  reason,
  type
}: CredentialUnexpectedFailure) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_ADD_CREDENTIAL_UNEXPECTED_FAILURE,
    buildEventProperties("KO", "error", { credential, reason, type })
  );
};

export const trackCredentialNotEntitledFailure = ({
  credential,
  reason,
  type
}: AddCredentialFailure) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_ADD_CREDENTIAL_NOT_ENTITLED_FAILURE,
    buildEventProperties("KO", "error", { credential, reason, type })
  );
};

export const trackCredentialInvalidStatusFailure = ({
  credential,
  reason,
  type
}: AddCredentialFailure) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_ADD_CREDENTIAL_INVALID_STATUS,
    buildEventProperties("KO", "error", { credential, reason, type })
  );
};

export const trackItwIdRequestUnexpectedFailure = ({
  reason,
  type
}: IdUnexpectedFailure) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_ID_REQUEST_UNEXPECTED_FAILURE,
    buildEventProperties("KO", "error", { reason, type })
  );
};

export const trackItwAlreadyActivated = () => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_ALREADY_ACTIVATED,
    buildEventProperties("KO", "error")
  );
};

export const trackItwStatusWalletAttestationFailure = () => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_STATUS_WALLET_ATTESTATION_FAILURE,
    buildEventProperties("KO", "error")
  );
};

export const trackItwStatusCredentialAssertionFailure = ({
  credential,
  credential_status,
  reason
}: CredentialStatusAssertionFailure) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_STATUS_CREDENTIAL_ATTESTATION_FAILURE,
    buildEventProperties("KO", "error", {
      credential,
      credential_status,
      reason
    })
  );
};

export const trackItwTrustmarkRenewFailure = (
  credential: MixPanelCredential
) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_TRUSTMARK_RENEW_FAILURE,
    buildEventProperties("KO", "error", { credential })
  );
};

export const trackItwOfflineReloadFailure = () => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_OFFLINE_RELOAD_FAILURE,
    buildEventProperties("KO", "error")
  );
};

export const trackItwWalletInstanceRevocation = (
  reason: WalletInstanceRevocationReason
) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_INSTANCE_REVOKED,
    buildEventProperties("KO", "error", { reason })
  );
};

export const trackItwWalletBadState = () => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_BAD_STATE_WALLET_DEACTIVATED,
    buildEventProperties("KO", "error")
  );
};

export const trackItwUpgradeL3Mandatory = (action: ItwL3UpgradeTrigger) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_UPGRADE_L3_MANDATORY,
    buildEventProperties("KO", "screen_view", { action })
  );
};

export const trackItwCieIdCieNotRegistered = (itwFlow: ItwFlow) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_CIEID_CIE_NOT_REGISTERED,
    buildEventProperties("KO", "screen_view", { itwFlow })
  );
};

export const trackItwNfcNotSupported = () => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_NFC_NOT_SUPPORTED,
    buildEventProperties("KO", "screen_view")
  );
};

export const trackItwUserWithoutL3Requirements = (
  itwUserWithoutL3requirements: ItwUserWithoutL3requirements
) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_USER_WITHOUT_L3_REQUIREMENTS,
    buildEventProperties("KO", "screen_view", itwUserWithoutL3requirements)
  );
};

export const trackItwAddCredentialNotTrustedIssuer = (
  properties: CredentialUnexpectedFailure
) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_ADD_CREDENTIAL_NOT_TRUSTED_ISSUER,
    buildEventProperties("KO", "screen_view", properties)
  );
};

export const trackItwCredentialReissuingFailed = (
  properties: ItwCredentialReissuingFailedProperties
) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_CREDENTIAL_REISSUING_FAILED,
    buildEventProperties("KO", "screen_view", properties)
  );
};

export const trackItwEidReissuingMandatory = (
  action: ItwEidReissuingTrigger
) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_REISSUING_EID_MANDATORY,
    buildEventProperties("KO", "screen_view", { action })
  );
};

export const trackMrtdPoPChallengeInfoFailed = (
  properties: TrackGetChallengeInfoFailure
) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_GET_CHALLENGE_INFO_FAILED,
    buildEventProperties("KO", "screen_view", properties)
  );
};

// #endregion ERRORS

// #region PROFILE PROPERTIES

export const trackCredentialDeleteProperties = (
  credential: MixPanelCredential,
  state: GlobalState
) => {
  if (!isMixPanelCredentialProperty(credential)) {
    return;
  }
  void updateMixpanelProfileProperties(state, {
    property: credential,
    value: "not_available"
  });
  void updateMixpanelSuperProperties(state, {
    property: credential,
    value: "not_available"
  });
};

export const trackAddCredentialProfileAndSuperProperties = (
  state: GlobalState,
  credential: MixPanelCredential
) => {
  if (!isMixPanelCredentialProperty(credential)) {
    return;
  }
  void updateMixpanelProfileProperties(state, {
    property: credential,
    value: "valid"
  });
  void updateMixpanelSuperProperties(state, {
    property: credential,
    value: "valid"
  });
};

// #endregion PROFILE PROPERTIES

// #region CONFIRM

export const trackSaveCredentialSuccess = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    ITW_CONFIRM_EVENTS.ITW_UX_SUCCESS,
    buildEventProperties("UX", "confirm", { credential })
  );
};

export const trackItwDeactivated = (
  state: GlobalState,
  credential: MixPanelCredential
) => {
  void mixpanelTrack(
    ITW_CONFIRM_EVENTS.ITW_DEACTIVATED,
    buildEventProperties("UX", "confirm", { credential })
  );
  updatePropertiesWalletRevoked(state);
};

// #endregion CONFIRM

// #region EXIT

export const trackItwExit = ({ exit_page, credential }: ItwExit) => {
  void mixpanelTrack(
    ITW_EXIT_EVENTS.ITW_USER_EXIT,
    buildEventProperties("UX", "exit", {
      exit_page,
      credential
    })
  );
};

export const trackBackToWallet = ({ exit_page, credential }: BackToWallet) => {
  void mixpanelTrack(
    ITW_EXIT_EVENTS.ITW_BACK_TO_WALLET,
    buildEventProperties("UX", "exit", {
      exit_page,
      credential
    })
  );
};
// #endregion EXIT

// #region TECH

export const trackItwRequest = (method?: ItwIdMethod, itw_flow?: ItwFlow) => {
  if (method) {
    void mixpanelTrack(
      ITW_TECH_EVENTS.ITW_ID_REQUEST,
      buildEventProperties("TECH", undefined, {
        ITW_ID_method: method,
        itw_flow
      })
    );
  }
};

export const trackItwRequestSuccess = (
  method?: ItwIdMethod,
  status?: ItwStatus,
  itw_flow?: ItwFlow
) => {
  if (method) {
    void mixpanelTrack(
      ITW_TECH_EVENTS.ITW_ID_REQUEST_SUCCESS,
      buildEventProperties("TECH", undefined, {
        ITW_ID_method: method,
        ITW_ID_V2: status,
        itw_flow
      })
    );
  }
};

export const trackItwRemoteStart = () => {
  void mixpanelTrack(
    ITW_TECH_EVENTS.ITW_REMOTE_START,
    buildEventProperties("TECH", undefined)
  );
};

export const trackItwIdAuthenticationCompleted = (
  ITW_ID_method: Exclude<ItwIdMethod, "ciePin">
) => {
  void mixpanelTrack(
    ITW_TECH_EVENTS.ITW_ID_AUTHENTICATION_COMPLETED,
    buildEventProperties("TECH", undefined, { ITW_ID_method })
  );
};

// #endregion TECH

// #region PROFILE AND SUPER PROPERTIES UPDATE

export const updateITWStatusAndPIDProperties = (state: GlobalState) => {
  const authLevel = itwAuthLevelSelector(state);
  if (!authLevel) {
    return;
  }

  const isItwL3 = itwLifecycleIsITWalletValidSelector(state);
  const eIDStatus = !isItwL3 ? getPIDMixpanelStatus(state, false) : undefined;
  const pidStatus = getPIDMixpanelStatus(state, true);

  void updateMixpanelProfileProperties(state, {
    property: "ITW_STATUS_V2",
    value: authLevel
  });
  void updateMixpanelSuperProperties(state, {
    property: "ITW_STATUS_V2",
    value: authLevel
  });
  if (eIDStatus) {
    void updateMixpanelProfileProperties(state, {
      property: "ITW_ID_V2",
      value: eIDStatus
    });
    void updateMixpanelSuperProperties(state, {
      property: "ITW_ID_V2",
      value: eIDStatus
    });
  }
  void updateMixpanelProfileProperties(state, {
    property: "ITW_PID",
    value: pidStatus
  });
  void updateMixpanelSuperProperties(state, {
    property: "ITW_PID",
    value: pidStatus
  });
};

/**
 * This function is used to set all to not_available / not_active when wallet is revoked or when the wallet section is visualized in empty state
 * @param state
 */
export const updatePropertiesWalletRevoked = (state: GlobalState) => {
  mixPanelCredentials.forEach(property => {
    // Avoid updating non-credential properties
    if (!isMixPanelCredentialProperty(property)) {
      return;
    }

    void updateMixpanelProfileProperties(state, {
      property,
      value: "not_available"
    });
    void updateMixpanelSuperProperties(state, {
      property,
      value: "not_available"
    });
  });
  void updateMixpanelProfileProperties(state, {
    property: "ITW_STATUS_V2",
    value: "not_active"
  });
  void updateMixpanelSuperProperties(state, {
    property: "ITW_STATUS_V2",
    value: "not_active"
  });
};

/**
 * Returns the PID status for Mixpanel analytics.
 * - If `isL3` is true → we consider the status from the current L3 PID (IT Wallet).
 * - If `isL3` is false → we use the current eID status.
 */
export const getPIDMixpanelStatus = (
  state: GlobalState,
  isL3: boolean
): ItwPIDStatus =>
  pipe(
    isL3
      ? pipe(
          itwLifecycleIsITWalletValidSelector(state),
          O.fromPredicate(Boolean),
          O.chain(() => O.fromNullable(itwCredentialsEidStatusSelector(state)))
        )
      : O.fromNullable(itwCredentialsEidStatusSelector(state)),
    O.map<ItwJwtCredentialStatus, ItwPIDStatus>(mapPIDStatusToMixpanel),
    O.getOrElse((): ItwPIDStatus => "not_available")
  );

/**
 * Returns the Mixpanel status for a credential type, considering IT Wallet.
 * - If `isItwL3` is explicitly false, returns `"not_available"`.
 * - If `isItwL3` is true and the credential exists but is not an ITW credential, returns `"not_available"`.
 * - Otherwise, retrieves the credential from the store and maps it to Mixpanel status.
 * - Returns `"not_available"` if the credential is missing.
 */
export const getMixpanelCredentialStatus = (
  type: CredentialType,
  state: GlobalState,
  isItwL3?: boolean
): ItwCredentialMixpanelStatus => {
  if (isItwL3 === false) {
    return "not_available";
  }
  const credential = itwCredentialsSelector(state)[type];
  if (isItwL3 && credential && !isItwCredential(credential)) {
    return "not_available";
  }

  return pipe(
    O.fromNullable(credential),
    O.map(cred => CREDENTIAL_STATUS_MAP[getCredentialStatus(cred)]),
    O.getOrElse(() => "not_available" as ItwCredentialMixpanelStatus)
  );
};

/**
 * Maps an PID status to its corresponding Mixpanel tracking status.
 */
export const mapPIDStatusToMixpanel = (
  status: ItwJwtCredentialStatus
): ItwPIDStatus => {
  switch (status) {
    case "valid":
      return "valid";
    case "jwtExpired":
      return "expired";
    case "jwtExpiring":
      return "expiring";
    default:
      return "not_available";
  }
};

// #endregion PROFILE AND SUPER PROPERTIES UPDATE

/**
 * Track the reason for offline access on Mixpanel
 * @param action - The action that was dispatched
 * @param state - The current state of the application
 */
export const trackOfflineAccessReason = (
  action: Action,
  state: GlobalState
): void | ReadonlyArray<null> => {
  switch (action.type) {
    case getType(setOfflineAccessReason):
      return void updateMixpanelSuperProperties(state, {
        property: "OFFLINE_ACCESS_REASON",
        value: action.payload
      });
    case getType(resetOfflineAccessReason):
      return void updateMixpanelSuperProperties(state, {
        property: "OFFLINE_ACCESS_REASON",
        value: "not_available"
      });
  }
};

/**
 * Returns the appropriate Mixpanel credential key based on the credential type.
 * - If the IT Wallet is active, returns the V3 key.
 * - Otherwise, returns the V2 key.
 * - If the credential type does not exist in CREDENTIALS_MAP, returns "UNKNOWN" as a fallback value.
 */
export function getMixPanelCredential(
  credentialType: string,
  isItwL3: boolean
): MixPanelCredential {
  const credential = CREDENTIALS_MAP[credentialType];

  if (!credential) {
    return "UNKNOWN";
  }

  // Handle case when there is only one version of the credential
  if (typeof credential === "string") {
    return credential;
  }

  return isItwL3 ? credential.V3 : credential.V2;
}

export const trackStartCredentialUpgrade = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_START_REISSUING,
    buildEventProperties("UX", "action", { credential })
  );
};
