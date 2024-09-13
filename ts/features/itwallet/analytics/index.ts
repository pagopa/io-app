import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";
import { CredentialType } from "../common/utils/itwMocksUtils";
import { IdentificationContext } from "../machine/eid/context";

enum WALLET_EVENTS {
  ITW_CREDENTIAL_PREVIEW = "ITW_CREDENTIAL_PREVIEW",
  ITW_UX_CONVERSION = "ITW_UX_CONVERSION",
  ITW_UX_SUCCESS = "ITW_UX_SUCCESS",
  ITW_ADD_FIRST_CREDENTIAL = "ITW_ADD_FIRST_CREDENTIAL",
  ITW_USER_EXIT = "ITW_USER_EXIT",
  ITW_BACK_TO_WALLET = "ITW_BACK_TO_WALLET",
  WALLET = "WALLET",
  WALLET_ADD_LIST_ITEM = "WALLET_ADD_LIST_ITEM",
  WALLET_ADD_START = "WALLET_ADD_START",
  ITW_KO_STATE_ACTION_SELECTED = "ITW_KO_STATE_ACTION_SELECTED",
  ITW_DATA_SHARE = "ITW_DATA_SHARE",
  ITW_DATA_SHARE_ACCEPTED = "ITW_DATA_SHARE_ACCEPTED",
  ITW_TOS = "ITW_TOS",
  ITW_ADD_CREDENTIAL_TIMEOUT = "ITW_ADD_CREDENTIAL_TIMEOUT",
  ITW_ADD_CREDENTIAL_FAILURE = "ITW_ADD_CREDENTIAL_FAILURE",
  ITW_ID_REQUEST = "ITW_ID_REQUEST",
  ITW_ID_REQUEST_SUCCESS = "ITW_ID_REQUEST_SUCCESS",
  ITW_ID_NOT_MATCH = "ITW_ID_NOT_MATCH",
  ITW_ID_REQUEST_TIMEOUT = "ITW_ID_REQUEST_TIMEOUT",
  ITW_ID_REQUEST_FAILURE = "ITW_ID_REQUEST_FAILURE",
  ITW_DEVICE_NOT_SUPPORTED = "ITW_DEVICE_NOT_SUPPORTED",
  ITW_LOGIN_ID_NOT_MATCH = "ITW_LOGIN_ID_NOT_MATCH",
  ITW_ALREADY_HAS_CREDENTIAL = "ITW_ALREADY_HAS_CREDENTIAL"
}

export type KoState = {
  reason: string;
  cta_category: "custom_1" | "custom_2";
  cta_id: string;
};

export type MixPanelCredential = "ITW_ID" | "ITW_PG" | "ITW_CED" | "ITW_TS";
export type OtherMixPanelCredential = "welfare" | "payment_method" | "CGN";
type NewCredential = MixPanelCredential | OtherMixPanelCredential;

export const CREDENTIALS_MAP: Record<CredentialType, MixPanelCredential> = {
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

export type ItwStatus = "not_active" | "L2" | "L3";
export type ItwId = "not_available" | "valid" | "not_valid";
export type ItwPg = "not_available" | "valid" | "not_valid" | "expiring";
export type ItwTs = "not_available" | "valid" | "not_valid" | "expiring";
export type ItwCed = "not_available" | "valid" | "not_valid" | "expiring";

export const trackCredentialPreview = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    WALLET_EVENTS.ITW_CREDENTIAL_PREVIEW,
    buildEventProperties("UX", "screen_view", { credential })
  );
};

export const trackSaveCredentialToWallet = (currentCredential: string) => {
  const credential = CREDENTIALS_MAP[currentCredential as CredentialType];
  if (credential) {
    void mixpanelTrack(
      WALLET_EVENTS.ITW_UX_CONVERSION,
      buildEventProperties("UX", "action", { credential })
    );
  }
};

export const trackSaveCredentialSuccess = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    WALLET_EVENTS.ITW_UX_SUCCESS,
    buildEventProperties("UX", "confirm", { credential })
  );
};

export const trackAddFirstCredential = () => {
  void mixpanelTrack(
    WALLET_EVENTS.ITW_ADD_FIRST_CREDENTIAL,
    buildEventProperties("UX", "action")
  );
};

export const trackItwExit = ({ exit_page, credential }: ItwExit) => {
  void mixpanelTrack(
    WALLET_EVENTS.ITW_USER_EXIT,
    buildEventProperties("UX", "exit", {
      exit_page,
      credential
    })
  );
};

export const trackBackToWallet = ({ exit_page, credential }: BackToWallet) => {
  void mixpanelTrack(
    WALLET_EVENTS.ITW_BACK_TO_WALLET,
    buildEventProperties("UX", "exit", {
      exit_page,
      credential
    })
  );
};

export const trackOpenWalletScreen = () => {
  void mixpanelTrack(
    WALLET_EVENTS.WALLET,
    buildEventProperties("UX", "screen_view")
  );
};

export const trackShowCredentialsList = () => {
  void mixpanelTrack(
    WALLET_EVENTS.WALLET_ADD_LIST_ITEM,
    buildEventProperties("UX", "screen_view")
  );
};

export const trackStartAddNewCredential = (wallet_item: NewCredential) => {
  void mixpanelTrack(
    WALLET_EVENTS.WALLET_ADD_START,
    buildEventProperties("UX", "action", {
      wallet_item,
      add_entry_point: "wallet_home",
      payment_home_status: "not_set"
    })
  );
};

export const trackWalletCreationFailed = (params: KoState) => {
  void mixpanelTrack(
    WALLET_EVENTS.ITW_KO_STATE_ACTION_SELECTED,
    buildEventProperties("UX", "action", { ...params })
  );
};

export const trackWalletDataShare = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    WALLET_EVENTS.ITW_DATA_SHARE,
    buildEventProperties("UX", "screen_view", { credential })
  );
};

export const trackWalletDataShareAccepted = (
  credential: MixPanelCredential
) => {
  void mixpanelTrack(
    WALLET_EVENTS.ITW_DATA_SHARE_ACCEPTED,
    buildEventProperties("UX", "action", { credential })
  );
};

export const trackOpenItwTos = () => {
  void mixpanelTrack(
    WALLET_EVENTS.ITW_TOS,
    buildEventProperties("UX", "action")
  );
};

export const trackAddCredentialTimeout = ({
  credential,
  reason
}: AddCredentialFailure) => {
  void mixpanelTrack(
    WALLET_EVENTS.ITW_ADD_CREDENTIAL_TIMEOUT,
    buildEventProperties("KO", "error", { credential, reason })
  );
};

export const trackAddCredentialFailure = ({
  credential,
  reason
}: AddCredentialFailure) => {
  void mixpanelTrack(
    WALLET_EVENTS.ITW_ADD_CREDENTIAL_FAILURE,
    buildEventProperties("KO", "error", { credential, reason })
  );
};

export const trackItwRequest = (ITW_ID_method?: ItwIdMethod) => {
  if (ITW_ID_method) {
    void mixpanelTrack(
      WALLET_EVENTS.ITW_ID_REQUEST,
      buildEventProperties("TECH", "error", { ITW_ID_method })
    );
  }
};

export const trackItwRequestSuccess = (ITW_ID_method?: ItwIdMethod) => {
  if (ITW_ID_method) {
    void mixpanelTrack(
      WALLET_EVENTS.ITW_ID_REQUEST_SUCCESS,
      buildEventProperties("TECH", "error", { ITW_ID_method, ITW_ID: "L2" })
    );
  }
};

export const trackIdNotMatch = (ITW_ID_method: ItwIdMethod) => {
  void mixpanelTrack(
    WALLET_EVENTS.ITW_ID_NOT_MATCH,
    buildEventProperties("KO", "error", { ITW_ID_method })
  );
};

export const trackItwIdRequestTimeout = (ITW_ID_method?: ItwIdMethod) => {
  if (ITW_ID_method) {
    void mixpanelTrack(
      WALLET_EVENTS.ITW_ID_REQUEST_TIMEOUT,
      buildEventProperties("KO", "error", { ITW_ID_method })
    );
  }
};

export const trackItwIdRequestFailure = (ITW_ID_method?: ItwIdMethod) => {
  if (ITW_ID_method) {
    void mixpanelTrack(
      WALLET_EVENTS.ITW_ID_REQUEST_FAILURE,
      buildEventProperties("KO", "error", { ITW_ID_method })
    );
  }
};

export const trackItwUnsupportedDevice = () => {
  void mixpanelTrack(
    WALLET_EVENTS.ITW_DEVICE_NOT_SUPPORTED,
    buildEventProperties("KO", "error")
  );
};

export const trackItwIdNotMatch = () => {
  void mixpanelTrack(
    WALLET_EVENTS.ITW_LOGIN_ID_NOT_MATCH,
    buildEventProperties("KO", "error")
  );
};

export const trackItwHasAlreadyCredential = () => {
  // TODO [SIW-1438] -> add status and credential
  void mixpanelTrack(
    WALLET_EVENTS.ITW_ALREADY_HAS_CREDENTIAL,
    buildEventProperties("KO", "error")
  );
};
