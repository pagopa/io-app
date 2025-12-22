import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";
import { WalletInstanceRevocationReason } from "../common/utils/itwTypesUtils";
import { IssuanceFailure } from "../machine/eid/failure";
import {
  ITW_ACTIONS_EVENTS,
  ITW_CONFIRM_EVENTS,
  ITW_ERRORS_EVENTS,
  ITW_EXIT_EVENTS,
  ITW_SCREENVIEW_EVENTS,
  ITW_TECH_EVENTS
} from "./enum";
import { updatePropertiesWalletRevoked } from "./properties/propertyUpdaters";
import { TrackITWalletBannerClosureProperties, ItwFlow, ItwWalletDataShare, ItwScreenFlowContext, TrackQualtricsSurvey, NewCredential, KoState, MixPanelCredential, TrackITWalletIDMethodSelected, TrackITWalletSpidIDPSelected, ItwCredentialInfoDetails, ItwOfflineRicaricaAppIOSource, ItwCopyListItem, ItwDismissalAction, TrackCredentialDetail, TrackItWalletCieCardVerifyFailure, TrackItWalletCieCardReadingFailure, TrackItWalletCieCardReadingUnexpectedFailure, ItwIdMethod, IdRequestFailure, AddCredentialFailure, CredentialUnexpectedFailure, IdUnexpectedFailure, CredentialStatusAssertionFailure, ItwL3UpgradeTrigger, ItwUserWithoutL3requirements, ItwCredentialReissuingFailedProperties, ItwEidReissuingTrigger, ItwExit, BackToWallet, ItwStatus } from "./utils/analyticsTypes";

// #region SCREEN VIEW EVENTS

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

export const trackWalletDataShare = (properties: ItwWalletDataShare) => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_DATA_SHARE,
    buildEventProperties("UX", "screen_view", properties)
  );
};

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

export const trackItwSurveyRequest = (properties: TrackQualtricsSurvey) => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.SURVEY_REQUEST,
    buildEventProperties("UX", "screen_view", properties)
  );
};

// #endregion SCREEN VIEW EVENTS

// #region ACTIONS

export function trackItWalletBannerTap(
  properties: TrackITWalletBannerClosureProperties
) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.TAP_BANNER,
    buildEventProperties("UX", "action", properties)
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

export const trackWalletDataShareAccepted = (
  properties: ItwWalletDataShare
) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_DATA_SHARE_ACCEPTED,
    buildEventProperties("UX", "action", properties)
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

export function trackWalletNewIdReset() {
  updatePropertiesWalletRevoked();
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_NEW_ID_RESET,
    buildEventProperties("UX", "action")
  );
}

export const trackItwCredentialStartIssuing = (
  credential: MixPanelCredential
) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_START_ISSUING,
    buildEventProperties("UX", "action", { credential })
  );
};

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

export function trackItwCredentialQualificationDetail(
  properties: ItwCredentialInfoDetails
) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_QUALIFICATION_DETAIL,
    buildEventProperties("UX", "action", properties)
  );
}

export const trackStartCredentialUpgrade = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_START_REISSUING,
    buildEventProperties("UX", "action", { credential })
  );
};

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

export function trackItWalletCardReadingClose(cie_reading_progress: number) {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CIE_CARD_READING_CLOSE,
    buildEventProperties("UX", "error", { cie_reading_progress })
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

export const trackIdNotMatch = (
  ITW_ID_method: ItwIdMethod,
  itw_flow: ItwFlow
) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_ID_NOT_MATCH,
    buildEventProperties("KO", "error", { ITW_ID_method, itw_flow })
  );
};

// TODO: Track IPZS timeout on eID flow
export const trackItwIdRequestTimeout = (
  ITW_ID_method?: ItwIdMethod,
  itw_flow: ItwFlow = "not_available"
) => {
  if (ITW_ID_method) {
    void mixpanelTrack(
      ITW_ERRORS_EVENTS.ITW_ID_REQUEST_TIMEOUT,
      buildEventProperties("KO", "error", { ITW_ID_method, itw_flow })
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
  type,
  itw_flow
}: IdUnexpectedFailure) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_ID_REQUEST_UNEXPECTED_FAILURE,
    buildEventProperties("KO", "error", { reason, type, itw_flow })
  );
};

export const trackItwAlreadyActivated = (itw_flow: ItwFlow) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_ALREADY_ACTIVATED,
    buildEventProperties("KO", "error", { itw_flow })
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

// #endregion ERRORS

// #region CONFIRM

export const trackSaveCredentialSuccess = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    ITW_CONFIRM_EVENTS.ITW_UX_SUCCESS,
    buildEventProperties("UX", "confirm", { credential })
  );
};

export const trackItwDeactivated = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    ITW_CONFIRM_EVENTS.ITW_DEACTIVATED,
    buildEventProperties("UX", "confirm", { credential })
  );
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

// #endregion TECH
