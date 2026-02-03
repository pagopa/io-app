import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";
import {
  ITW_ACTIONS_EVENTS,
  ITW_CONFIRM_EVENTS,
  ITW_ERRORS_EVENTS,
  ITW_SCREENVIEW_EVENTS,
  ITW_TECH_EVENTS
} from "./enum";
import {
  TrackITWalletBannerProperties,
  ItwFlow,
  ItwWalletDataShare,
  ItwScreenFlowContext,
  TrackQualtricsSurvey,
  NewCredential,
  KoState,
  MixPanelCredential,
  TrackITWalletIDMethodSelected,
  ItwCredentialInfoDetails,
  ItwCopyListItem,
  ItwDismissalAction,
  ItwIdMethod,
  CredentialStatusAssertionFailure,
  ItwCredentialDetails,
  TrackSaveCredentialSuccess
} from "./utils/types";

// Screen view events

export const trackITWalletBannerVisualized = (
  properties: TrackITWalletBannerProperties
) => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.BANNER,
    buildEventProperties("UX", "screen_view", properties)
  );
};

export const trackItWalletIntroScreen = (itw_flow: ItwFlow) => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_INTRO,
    buildEventProperties("UX", "screen_view", { itw_flow })
  );
};

export const trackOpenWalletScreen = (
  credential_details: ItwCredentialDetails
) => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.WALLET,
    buildEventProperties("UX", "screen_view", { credential_details })
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

export const trackItwDismissalContext = (
  screenFlowContext: ItwScreenFlowContext
) => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_OPERATION_BLOCK,
    buildEventProperties("UX", "screen_view", screenFlowContext)
  );
};

export const trackItwUpgradeBanner = (
  properties: TrackITWalletBannerProperties
) => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_BANNER,
    buildEventProperties("UX", "screen_view", { properties })
  );
};

export const trackItwSurveyRequest = (properties: TrackQualtricsSurvey) => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.SURVEY_REQUEST,
    buildEventProperties("UX", "screen_view", properties)
  );
};

// Actions events

export const trackItWalletBannerTap = (
  properties: TrackITWalletBannerProperties
) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.TAP_BANNER,
    buildEventProperties("UX", "action", properties)
  );
};

export const trackItWalletBannerClosure = (
  properties: TrackITWalletBannerProperties
) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.CLOSE_BANNER,
    buildEventProperties("UX", "action", properties)
  );
};

export const trackOpenItwTos = () => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_TOS,
    buildEventProperties("UX", "action")
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

export const trackItWalletIDMethodSelected = (
  properties: TrackITWalletIDMethodSelected
) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_ID_METHOD_SELECTED,
    buildEventProperties("UX", "action", properties)
  );
};

export const trackWalletAdd = () => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.WALLET_ADD,
    buildEventProperties("UX", "action")
  );
};

export const trackWalletCategoryFilter = (wallet_category: string) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.WALLET_CATEGORY_FILTER,
    buildEventProperties("UX", "action", { wallet_category })
  );
};

export const trackWalletCredentialShowIssuer = (
  properties: ItwCredentialInfoDetails
) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_SHOW_ISSUER,
    buildEventProperties("UX", "action", properties)
  );
};

export const trackWalletCredentialShowAuthSource = (
  properties: ItwCredentialInfoDetails
) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_SHOW_AUTH_SOURCE,
    buildEventProperties("UX", "action", properties)
  );
};

export const trackWalletStartDeactivation = (
  credential: MixPanelCredential
) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_START_DEACTIVATION,
    buildEventProperties("UX", "action", { credential })
  );
};

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

export const trackItwTapUpgradeBanner = (
  properties: TrackITWalletBannerProperties
) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_TAP_BANNER,
    buildEventProperties("UX", "action", { properties })
  );
};

export const trackItwCloseUpgradeBanner = (
  properties: TrackITWalletBannerProperties
) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CLOSE_BANNER,
    buildEventProperties("UX", "action", { properties })
  );
};

export const trackItwCredentialQualificationDetail = (
  properties: ItwCredentialInfoDetails
) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_CREDENTIAL_QUALIFICATION_DETAIL,
    buildEventProperties("UX", "action", properties)
  );
};

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

// Errors events

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

// Confirm events

export const trackSaveCredentialSuccess = (
  properties: TrackSaveCredentialSuccess
) => {
  void mixpanelTrack(
    ITW_CONFIRM_EVENTS.ITW_UX_SUCCESS,
    buildEventProperties("UX", "confirm", properties)
  );
};

export const trackItwDeactivated = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    ITW_CONFIRM_EVENTS.ITW_DEACTIVATED,
    buildEventProperties("UX", "confirm", { credential })
  );
};

// Tech events

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

export const trackItwIdAuthenticationCompleted = (
  ITW_ID_method: Exclude<ItwIdMethod, "ciePin">
) => {
  void mixpanelTrack(
    ITW_TECH_EVENTS.ITW_ID_AUTHENTICATION_COMPLETED,
    buildEventProperties("TECH", undefined, { ITW_ID_method })
  );
};

export const trackItwIdVerifiedDocument = (
  ITW_ID_method: Exclude<ItwIdMethod, "ciePin">
) => {
  void mixpanelTrack(
    ITW_TECH_EVENTS.ITW_ID_VERIFIED_DOCUMENT,
    buildEventProperties("TECH", undefined, { ITW_ID_method })
  );
};
