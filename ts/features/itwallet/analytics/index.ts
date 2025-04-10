import { mixpanelTrack } from "../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../mixpanelConfig/profileProperties";
import { updateMixpanelSuperProperties } from "../../../mixpanelConfig/superProperties";
import { GlobalState } from "../../../store/reducers/types";
import { buildEventProperties } from "../../../utils/analytics";
import { IdentificationContext } from "../machine/eid/context";
import { IssuanceFailure } from "../machine/eid/failure";
import { ItwCredentialStatus } from "../common/utils/itwTypesUtils";
import { itwAuthLevelSelector } from "../common/store/selectors/preferences.ts";
import { OfflineAccessReasonEnum } from "../../ingress/store/reducer";
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

/**
 * This is the list of credentials that are tracked in MixPanel
 * ITW_ID_V2: PersonIdentificationData
 * ITW_PG_V2: MDL
 * ITW_CED_V2: EuropeanDisabilityCard
 * ITW_TS_V2: EuropeanHealthInsuranceCard
 */
const mixPanelCredentials = [
  "ITW_ID_V2",
  "ITW_PG_V2",
  "ITW_CED_V2",
  "ITW_TS_V2"
] as const;

type MixPanelCredential = (typeof mixPanelCredentials)[number];

type TrackCredentialDetail = {
  credential: MixPanelCredential; // MixPanelCredential
  credential_status: string; // ItwPg
};

export type OtherMixPanelCredential = "welfare" | "payment_method" | "CGN";
type NewCredential = MixPanelCredential | OtherMixPanelCredential;

type ItwFailureCause = "CredentialIssuer" | "WalletProvider";

/**
 * This map is used to map the credential type to the MixPanel credential
 * ITW_ID_V2: PersonIdentificationData
 * ITW_PG_V2: MDL
 * ITW_CED_V2: EuropeanDisabilityCard
 * ITW_TS_V2: EuropeanHealthInsuranceCard
 */
export const CREDENTIALS_MAP: Record<string, MixPanelCredential> = {
  PersonIdentificationData: "ITW_ID_V2",
  MDL: "ITW_PG_V2",
  EuropeanDisabilityCard: "ITW_CED_V2",
  EuropeanHealthInsuranceCard: "ITW_TS_V2"
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

type CredentialStatusAttestationFailure = {
  credential: MixPanelCredential;
  credential_status: string;
  reason?: unknown;
};

type ItwIdMethod = IdentificationContext["mode"];

// PROPERTIES TYPES
type TrackITWalletBannerClosureProperties = {
  banner_id: string;
  // banner_campaign: string (EVOLUTIVA)
  banner_page: string;
  banner_landing: string;
};

type TrackITWalletIDMethodSelected = {
  ITW_ID_method: "spid" | "ciePin" | "cieId";
};

type TrackITWalletSpidIDPSelected = { idp: string };

type TrackItWalletCieCardReadingFailure = { reason: string };

export type ItwStatus = "not_active" | "L2" | "L3";
export type ItwId = "not_available" | "valid" | "not_valid";
export type ItwPg = "not_available" | "valid" | "not_valid" | "expiring";
export type ItwTs = "not_available" | "valid" | "not_valid" | "expiring";
export type ItwCed = "not_available" | "valid" | "not_valid" | "expiring";

/**
 * This map is used to map the eid credential status to the MixPanel eid credential status
 * valid: valid
 * pending: not_valid
 * expired: not_valid
 * expiring: expiring
 */
export const ID_STATUS_MAP: Record<
  ItwCredentialStatus,
  "valid" | "not_valid" | "expiring" | "unknown"
> = {
  valid: "valid",
  invalid: "not_valid",
  expired: "not_valid",
  expiring: "expiring",
  jwtExpired: "not_valid",
  jwtExpiring: "expiring",
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

type ItwOfflineBanner = {
  screen: string;
  error_message_type: OfflineAccessReasonEnum;
  use_case: "starting_app" | "foreground" | "background";
};

type ItwOfflineRicaricaAppIO = {
  source: "bottom_sheet" | "banner";
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

export const trackCredentialPreview = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_CREDENTIAL_PREVIEW,
    buildEventProperties("UX", "screen_view", { credential })
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

export function trackItWalletIntroScreen() {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_INTRO,
    buildEventProperties("UX", "screen_view")
  );
}

export function trackItWalletIDMethod() {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_ID_METHOD,
    buildEventProperties("UX", "screen_view")
  );
}

export function trackItWalletSpidIDPSelection() {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_SPID_IDP_SELECTION,
    buildEventProperties("UX", "screen_view")
  );
}

export function trackItWalletCiePinEnter() {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_CIE_PIN_ENTER,
    buildEventProperties("UX", "screen_view")
  );
}

export function trackItWalletCieNfcActivation() {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_CIE_NFC_ACTIVATION,
    buildEventProperties("UX", "screen_view")
  );
}

export function trackItWalletCieCardReading() {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_CIE_CARD_READING,
    buildEventProperties("UX", "screen_view")
  );
}

export function trackItWalletCieCardReadingSuccess() {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_CARD_READING_SUCCESS,
    buildEventProperties("UX", "screen_view")
  );
}

export function trackItWalletDeferredIssuing(credential: MixPanelCredential) {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_DEFERRED_ISSUING,
    buildEventProperties("UX", "screen_view", { credential })
  );
}

export function trackWalletCredentialFAC_SIMILE() {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS["ITW_CREDENTIAL_FAC-SIMILE"],
    buildEventProperties("UX", "screen_view", { credential: "ITW_TS_V2" })
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

export const trackOpenItwTosAccepted = () => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_TOS_ACCEPTED,
    buildEventProperties("UX", "action")
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

export const trackWalletCreationFailed = (params: KoState) => {
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

export const trackSaveCredentialToWallet = (currentCredential: string) => {
  const credential = CREDENTIALS_MAP[currentCredential];
  if (credential) {
    void mixpanelTrack(
      ITW_ACTIONS_EVENTS.ITW_UX_CONVERSION,
      buildEventProperties("UX", "action", { credential })
    );
  }
};

export function trackItWalletActivationStart() {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_ID_START,
    buildEventProperties("UX", "action")
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

export function trackItWalletCiePinInfo() {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CIE_PIN_INFO,
    buildEventProperties("UX", "action")
  );
}

export function trackItWalletCiePinForgotten() {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CIE_PIN_FORGOTTEN,
    buildEventProperties("UX", "action")
  );
}

export function trackItWalletCiePukForgotten() {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CIE_PUK_FORGOTTEN,
    buildEventProperties("UX", "action")
  );
}

export function trackItWalletCieNfcGoToSettings() {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CIE_NFC_GO_TO_SETTINGS,
    buildEventProperties("UX", "action")
  );
}

export function trackItWalletCieRetryPin() {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CIE_RETRY_PIN,
    buildEventProperties("UX", "action")
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
  credential: MixPanelCredential
) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_SHOW_ISSUER,
    buildEventProperties("UX", "action", { credential })
  );
}

export function trackWalletCredentialShowAuthSource(
  credential: MixPanelCredential
) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_SHOW_AUTH_SOURCE,
    buildEventProperties("UX", "action", { credential })
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

export function trackWalletStartDeactivation() {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_START_DEACTIVATION,
    buildEventProperties("UX", "action")
  );
}

export function trackWalletNewIdReset(state: GlobalState) {
  updatePropertiesWalletRevoked(state);
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_NEW_ID_RESET,
    buildEventProperties("UX", "action")
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

export function trackItwOfflineRicaricaAppIO({
  source
}: ItwOfflineRicaricaAppIO) {
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

// #endregion ACTIONS

// #region ERRORS

export function trackItWalletErrorCardReading() {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_CIE_CARD_READING_ERROR,
    buildEventProperties("UX", "error")
  );
}

export function trackItWalletErrorPin() {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_CIE_PIN_ERROR,
    buildEventProperties("UX", "error")
  );
}

export function trackItWalletSecondErrorPin() {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_CIE_PIN_SECOND_ERROR,
    buildEventProperties("UX", "error")
  );
}

export function trackItWalletLastErrorPin() {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_CIE_PIN_LAST_ERROR,
    buildEventProperties("UX", "error")
  );
}

export function trackItWalletCieCardVerifyFailure() {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_CIE_CARD_VERIFY_FAILURE,
    buildEventProperties("UX", "error")
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

export const trackItwStatusCredentialAttestationFailure = ({
  credential,
  credential_status,
  reason
}: CredentialStatusAttestationFailure) => {
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

export const trackItwOfflineActionNotAllowed = (screen: { screen: string }) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_OFFLINE_ACTION_NOT_ALLOWED,
    buildEventProperties("KO", "error", { screen })
  );
};

// #endregion ERRORS

// #region PROFILE PROPERTIES

export const trackCredentialDeleteProperties = (
  credential: MixPanelCredential,
  state: GlobalState
) => {
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

export const trackItwDeactivated = (state: GlobalState) => {
  void mixpanelTrack(
    ITW_CONFIRM_EVENTS.ITW_DEACTIVATED,
    buildEventProperties("UX", "confirm")
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

export const trackItwRequest = (method?: ItwIdMethod) => {
  if (method) {
    void mixpanelTrack(
      ITW_TECH_EVENTS.ITW_ID_REQUEST,
      buildEventProperties("TECH", undefined, { ITW_ID_method: method })
    );
  }
};

export const trackItwRequestSuccess = (
  method?: ItwIdMethod,
  status?: ItwStatus
) => {
  if (method) {
    void mixpanelTrack(
      ITW_TECH_EVENTS.ITW_ID_REQUEST_SUCCESS,
      buildEventProperties("TECH", undefined, {
        ITW_ID_method: method,
        ITW_ID_V2: status
      })
    );
  }
};

export const trackItwOfflineBanner = ({
  screen,
  error_message_type,
  use_case
}: ItwOfflineBanner) => {
  void mixpanelTrack(
    ITW_TECH_EVENTS.ITW_ID_REQUEST_SUCCESS,
    buildEventProperties("TECH", undefined, {
      screen,
      error_message_type,
      use_case
    })
  );
};

// #endregion TECH

// #region PROFILE AND SUPER PROPERTIES UPDATE

export const updateITWStatusAndIDProperties = (state: GlobalState) => {
  const authLevel = itwAuthLevelSelector(state);
  if (!authLevel) {
    return;
  }

  void updateMixpanelProfileProperties(state, {
    property: "ITW_STATUS_V2",
    value: authLevel
  });
  void updateMixpanelSuperProperties(state, {
    property: "ITW_STATUS_V2",
    value: authLevel
  });
  void updateMixpanelProfileProperties(state, {
    property: "ITW_ID_V2",
    value: "valid"
  });
  void updateMixpanelSuperProperties(state, {
    property: "ITW_ID_V2",
    value: "valid"
  });
};

/**
 * This function is used to set all to not_available / not_active when wallet is revoked or when the wallet section is visualized in empty state
 * @param state
 */
export const updatePropertiesWalletRevoked = (state: GlobalState) => {
  mixPanelCredentials.forEach(property => {
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

// #endregion PROFILE AND SUPER PROPERTIES UPDATE
