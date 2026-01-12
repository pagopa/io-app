import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import {
  ItwFlow,
  ItwIdMethod,
  ItwStatus,
  MixPanelCredential
} from "../../analytics/utils/types";
import { IssuanceFailure } from "../../machine/eid/failure";
import {
  AddCredentialFailure,
  BackToWallet,
  CredentialUnexpectedFailure,
  IdRequestFailure,
  IdUnexpectedFailure,
  ItwCredentialReissuingFailedProperties,
  ItwExit,
  TrackCredentialPreview,
  TrackGetChallengeInfoFailure
} from "./types";
import {
  ITW_ISSUANCE_ACTIONS_EVENTS,
  ITW_ISSUANCE_ERRORS_EVENTS,
  ITW_ISSUANCE_EXIT_EVENTS,
  ITW_ISSUANCE_SCREENVIEW_EVENTS,
  ITW_ISSUANCE_TECH_EVENTS
} from "./enum";

// Screen view events

export const trackCredentialPreview = (
  credentialPreview: TrackCredentialPreview
) => {
  void mixpanelTrack(
    ITW_ISSUANCE_SCREENVIEW_EVENTS.ITW_CREDENTIAL_PREVIEW,
    buildEventProperties("UX", "screen_view", credentialPreview)
  );
};

export const trackItwCredentialIntro = (credential: MixPanelCredential) => {
  void mixpanelTrack(
    ITW_ISSUANCE_SCREENVIEW_EVENTS.ITW_CREDENTIAL_INTRO,
    buildEventProperties("UX", "screen_view", { credential })
  );
};

// Actions events

export const trackAddFirstCredential = () => {
  void mixpanelTrack(
    ITW_ISSUANCE_ACTIONS_EVENTS.ITW_ADD_FIRST_CREDENTIAL,
    buildEventProperties("UX", "action")
  );
};

export const trackSaveCredentialToWallet = (credential: MixPanelCredential) => {
  if (credential) {
    void mixpanelTrack(
      ITW_ISSUANCE_ACTIONS_EVENTS.ITW_UX_CONVERSION,
      buildEventProperties("UX", "action", { credential })
    );
  }
};

export const trackItwCredentialStartIssuing = (
  credential: MixPanelCredential
) => {
  void mixpanelTrack(
    ITW_ISSUANCE_ACTIONS_EVENTS.ITW_CREDENTIAL_START_ISSUING,
    buildEventProperties("UX", "action", { credential })
  );
};

export const trackIssuanceCredentialScrollToBottom = (
  credential: MixPanelCredential,
  screenRoute: string
) => {
  void mixpanelTrack(
    ITW_ISSUANCE_ACTIONS_EVENTS.ITW_ISSUANCE_CREDENTIAL_SCROLL,
    buildEventProperties("UX", "action", { credential, screen: screenRoute })
  );
};

// Errors events

export const trackIdNotMatch = (
  ITW_ID_method: ItwIdMethod,
  itw_flow: ItwFlow
) => {
  void mixpanelTrack(
    ITW_ISSUANCE_ERRORS_EVENTS.ITW_ID_NOT_MATCH,
    buildEventProperties("KO", "error", { ITW_ID_method, itw_flow })
  );
};

export const trackItwIdRequestFailure = (properties: IdRequestFailure) => {
  if (properties.ITW_ID_method) {
    void mixpanelTrack(
      ITW_ISSUANCE_ERRORS_EVENTS.ITW_ID_REQUEST_FAILURE,
      buildEventProperties("KO", "error", properties)
    );
  }
};

export const trackItwUnsupportedDevice = (properties: IssuanceFailure) => {
  void mixpanelTrack(
    ITW_ISSUANCE_ERRORS_EVENTS.ITW_DEVICE_NOT_SUPPORTED,
    buildEventProperties("KO", "error", { reason: properties.reason })
  );
};

export const trackAddCredentialFailure = ({
  credential,
  reason,
  type
}: AddCredentialFailure) => {
  void mixpanelTrack(
    ITW_ISSUANCE_ERRORS_EVENTS.ITW_ADD_CREDENTIAL_FAILURE,
    buildEventProperties("KO", "error", { credential, reason, type })
  );
};

export const trackAddCredentialUnexpectedFailure = ({
  credential,
  reason,
  type
}: CredentialUnexpectedFailure) => {
  void mixpanelTrack(
    ITW_ISSUANCE_ERRORS_EVENTS.ITW_ADD_CREDENTIAL_UNEXPECTED_FAILURE,
    buildEventProperties("KO", "error", { credential, reason, type })
  );
};

export const trackCredentialNotEntitledFailure = ({
  credential,
  reason,
  type
}: AddCredentialFailure) => {
  void mixpanelTrack(
    ITW_ISSUANCE_ERRORS_EVENTS.ITW_ADD_CREDENTIAL_NOT_ENTITLED_FAILURE,
    buildEventProperties("KO", "error", { credential, reason, type })
  );
};

export const trackCredentialInvalidStatusFailure = ({
  credential,
  reason,
  type
}: AddCredentialFailure) => {
  void mixpanelTrack(
    ITW_ISSUANCE_ERRORS_EVENTS.ITW_ADD_CREDENTIAL_INVALID_STATUS,
    buildEventProperties("KO", "error", { credential, reason, type })
  );
};

export const trackItwIdRequestUnexpectedFailure = ({
  reason,
  type,
  itw_flow
}: IdUnexpectedFailure) => {
  void mixpanelTrack(
    ITW_ISSUANCE_ERRORS_EVENTS.ITW_ID_REQUEST_UNEXPECTED_FAILURE,
    buildEventProperties("KO", "error", { reason, type, itw_flow })
  );
};

export const trackItwCieIdCieNotRegistered = (itwFlow: ItwFlow) => {
  void mixpanelTrack(
    ITW_ISSUANCE_ERRORS_EVENTS.ITW_CIEID_CIE_NOT_REGISTERED,
    buildEventProperties("KO", "screen_view", { itwFlow })
  );
};

export const trackItwAddCredentialNotTrustedIssuer = (
  properties: CredentialUnexpectedFailure
) => {
  void mixpanelTrack(
    ITW_ISSUANCE_ERRORS_EVENTS.ITW_ADD_CREDENTIAL_NOT_TRUSTED_ISSUER,
    buildEventProperties("KO", "screen_view", properties)
  );
};

export const trackItwCredentialReissuingFailed = (
  properties: ItwCredentialReissuingFailedProperties
) => {
  void mixpanelTrack(
    ITW_ISSUANCE_ERRORS_EVENTS.ITW_CREDENTIAL_REISSUING_FAILED,
    buildEventProperties("KO", "screen_view", properties)
  );
};

export const trackMrtdPoPChallengeInfoFailed = (
  properties: TrackGetChallengeInfoFailure
) => {
  void mixpanelTrack(
    ITW_ISSUANCE_ERRORS_EVENTS.ITW_GET_CHALLENGE_INFO_FAILED,
    buildEventProperties("KO", "screen_view", properties)
  );
};

// Exit events

export const trackItwExit = ({ exit_page, credential }: ItwExit) => {
  void mixpanelTrack(
    ITW_ISSUANCE_EXIT_EVENTS.ITW_USER_EXIT,
    buildEventProperties("UX", "exit", {
      exit_page,
      credential
    })
  );
};

export const trackBackToWallet = ({ exit_page, credential }: BackToWallet) => {
  void mixpanelTrack(
    ITW_ISSUANCE_EXIT_EVENTS.ITW_BACK_TO_WALLET,
    buildEventProperties("UX", "exit", {
      exit_page,
      credential
    })
  );
};

// Tech events

export const trackItwRequestSuccess = (
  method?: ItwIdMethod,
  status?: ItwStatus,
  itw_flow?: ItwFlow
) => {
  if (method) {
    void mixpanelTrack(
      ITW_ISSUANCE_TECH_EVENTS.ITW_ID_REQUEST_SUCCESS,
      buildEventProperties("TECH", undefined, {
        ITW_ID_method: method,
        ITW_ID_V2: status,
        itw_flow
      })
    );
  }
};
