import { mixpanelTrack } from "../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../mixpanelConfig/profileProperties";
import { GlobalState } from "../../../store/reducers/types";
import { buildEventProperties } from "../../../utils/analytics";
import { IdentificationContext } from "../machine/eid/context";
import {
  ITW_ACTIONS_EVENTS,
  ITW_CONFIRM_EVENTS,
  ITW_ERRORS_EVENTS,
  ITW_EXIT_EVENTS,
  ITW_SCREENVIEW_EVENTS,
  ITW_TECH_EVENTS
} from "./enum";

export type KoState = {
  reason: string;
  cta_category: "custom_1" | "custom_2";
  cta_id: string;
};

const mixPanelCredentials = ["ITW_ID", "ITW_PG", "ITW_CED", "ITW_TS"] as const;

type MixPanelCredential = (typeof mixPanelCredentials)[number];

export type OtherMixPanelCredential = "welfare" | "payment_method" | "CGN";
type NewCredential = MixPanelCredential | OtherMixPanelCredential;

export const CREDENTIALS_MAP: Record<string, MixPanelCredential> = {
  PersonIdentificationData: "ITW_ID",
  MDL: "ITW_PG",
  EuropeanDisabilityCard: "ITW_CED",
  EuropeanHealthInsuranceCard: "ITW_TS"
};

type BackToWallet = {
  exit_page: string;
  credential: Extract<MixPanelCredential, "ITW_ID">;
};

type ItwExit = {
  exit_page: string;
  credential: MixPanelCredential;
};

type AddCredentialFailure = {
  credential: MixPanelCredential;
  reason: string;
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
  ITW_ID_method: "spid" | "cie_pin" | "cieid";
};

type TrackITWalletSpidIDPSelected = { idp: string };

type TrackItWalletCieCardReadingFailure = { reason: string };

export type ItwStatus = "not_active" | "L2" | "L3";
export type ItwId = "not_available" | "valid" | "not_valid";
export type ItwPg = "not_available" | "valid" | "not_valid" | "expiring";
export type ItwTs = "not_available" | "valid" | "not_valid" | "expiring";
export type ItwCed = "not_available" | "valid" | "not_valid" | "expiring";

export const trackCredentialPreview = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_CREDENTIAL_PREVIEW,
    buildEventProperties("UX", "screen_view", { credential })
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

export const trackSaveCredentialSuccess = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    ITW_CONFIRM_EVENTS.ITW_UX_SUCCESS,
    buildEventProperties("UX", "confirm", { credential })
  );
};

export const trackAddFirstCredential = () => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_ADD_FIRST_CREDENTIAL,
    buildEventProperties("UX", "action")
  );
};

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

export const trackWalletDataShare = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    ITW_SCREENVIEW_EVENTS.ITW_DATA_SHARE,
    buildEventProperties("UX", "screen_view", { credential })
  );
};

export const trackWalletDataShareAccepted = (
  credential: MixPanelCredential
) => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_DATA_SHARE_ACCEPTED,
    buildEventProperties("UX", "action", { credential })
  );
};

export const trackOpenItwTos = () => {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.ITW_TOS,
    buildEventProperties("UX", "action")
  );
};

export const trackAddCredentialTimeout = ({
  credential,
  reason
}: AddCredentialFailure) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_ADD_CREDENTIAL_TIMEOUT,
    buildEventProperties("KO", "error", { credential, reason })
  );
};

export const trackAddCredentialFailure = ({
  credential,
  reason
}: AddCredentialFailure) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_ADD_CREDENTIAL_FAILURE,
    buildEventProperties("KO", "error", { credential, reason })
  );
};

export const trackItwRequest = (ITW_ID_method?: ItwIdMethod) => {
  if (ITW_ID_method) {
    void mixpanelTrack(
      ITW_TECH_EVENTS.ITW_ID_REQUEST,
      buildEventProperties("TECH", undefined, { ITW_ID_method })
    );
  }
};

export const trackItwRequestSuccess = (ITW_ID_method?: ItwIdMethod) => {
  if (ITW_ID_method) {
    void mixpanelTrack(
      ITW_TECH_EVENTS.ITW_ID_REQUEST_SUCCESS,
      buildEventProperties("TECH", undefined, { ITW_ID_method, ITW_ID: "L2" })
    );
  }
};

export const trackIdNotMatch = (ITW_ID_method: ItwIdMethod) => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_ID_NOT_MATCH,
    buildEventProperties("KO", "error", { ITW_ID_method })
  );
};

export const trackItwIdRequestTimeout = (ITW_ID_method?: ItwIdMethod) => {
  if (ITW_ID_method) {
    void mixpanelTrack(
      ITW_ERRORS_EVENTS.ITW_ID_REQUEST_TIMEOUT,
      buildEventProperties("KO", "error", { ITW_ID_method })
    );
  }
};

export const trackItwIdRequestFailure = (ITW_ID_method?: ItwIdMethod) => {
  if (ITW_ID_method) {
    void mixpanelTrack(
      ITW_ERRORS_EVENTS.ITW_ID_REQUEST_FAILURE,
      buildEventProperties("KO", "error", { ITW_ID_method })
    );
  }
};

export const trackItwUnsupportedDevice = () => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_DEVICE_NOT_SUPPORTED,
    buildEventProperties("KO", "error")
  );
};

export const trackItwIdNotMatch = () => {
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_LOGIN_ID_NOT_MATCH,
    buildEventProperties("KO", "error")
  );
};

export const trackCredentialPropertiesSuccess = async (
  credential: MixPanelCredential,
  state: GlobalState
) => {
  await updateMixpanelProfileProperties(state, {
    property: credential,
    value: "valid"
  });
};

export const trackAllCredentialProfileProperties = async (
  state: GlobalState
) => {
  mixPanelCredentials.forEach(
    async credential =>
      await updateMixpanelProfileProperties(state, {
        property: credential,
        value: "valid"
      })
  );
};

export const trackItwHasAlreadyCredential = () => {
  // TODO [SIW-1438] -> add status and credential
  void mixpanelTrack(
    ITW_ERRORS_EVENTS.ITW_ALREADY_HAS_CREDENTIAL,
    buildEventProperties("KO", "error")
  );
};

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

// SCREEN VIEW EVENTS
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

// ERROR EVENTS

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

export function trackWalletAdd() {
  void mixpanelTrack(
    ITW_ACTIONS_EVENTS.WALLET_ADD,
    buildEventProperties("UX", "action")
  );
}
