import { mixpanelTrack } from "../../../../../mixpanel";
import { buildEventProperties } from "../../../../../utils/analytics";
import {
  ITW_REMOTE_ACTIONS_EVENTS,
  ITW_REMOTE_ERRORS_EVENTS,
  ITW_REMOTE_SCREENVIEW_EVENTS,
  ITW_REMOTE_TECH_EVENTS
} from "./enum";
import {
  ItwRemoteDataShare,
  ItwRemoteFailure,
  ItwRemoteMissingCredential,
  ItwRemoteInvalidCredential,
  ItwL3UpgradeTrigger
} from "./utils/types";

// #region SCREEN VIEW EVENTS

export const trackItwRemoteUntrustedRPBottomSheet = () => {
  void mixpanelTrack(
    ITW_REMOTE_SCREENVIEW_EVENTS.ITW_REMOTE_RP_NOT_TRUSTED_BOTTOMSHEET,
    buildEventProperties("UX", "screen_view")
  );
};

export const trackItwRemoteDataShare = ({
  data_type,
  request_type
}: ItwRemoteDataShare) => {
  void mixpanelTrack(
    ITW_REMOTE_SCREENVIEW_EVENTS.ITW_REMOTE_DATA_SHARE,
    buildEventProperties("UX", "screen_view", { data_type, request_type })
  );
};

export const trackItwRemoteInvalidAuthResponseBottomSheet = () => {
  void mixpanelTrack(
    ITW_REMOTE_SCREENVIEW_EVENTS.ITW_REMOTE_INVALID_AUTH_RESPONSE_BOTTOMSHEET,
    buildEventProperties("UX", "screen_view")
  );
};

export const trackItwRemotePresentationCompleted = (redirect_url: boolean) => {
  void mixpanelTrack(
    ITW_REMOTE_SCREENVIEW_EVENTS.ITW_REMOTE_UX_SUCCESS,
    buildEventProperties("UX", "screen_view", { redirect_url })
  );
};

// #endregion SCREEN VIEW EVENTS

// #region ACTIONS

export const trackItwRemoteContinuePresentation = () => {
  void mixpanelTrack(
    ITW_REMOTE_ACTIONS_EVENTS.ITW_REMOTE_UX_CONVERSION,
    buildEventProperties("UX", "action")
  );
};

// #endregion ACTIONS

// #region ERRORS

export const trackItwRemoteUnexpectedFailure = ({
  reason,
  type
}: ItwRemoteFailure) => {
  void mixpanelTrack(
    ITW_REMOTE_ERRORS_EVENTS.ITW_REMOTE_UNEXPECTED_FAILURE,
    buildEventProperties("KO", "error", { reason, type })
  );
};

export const trackItwRemoteIdentityNeedsVerification = () => {
  void mixpanelTrack(
    ITW_REMOTE_ERRORS_EVENTS.ITW_REMOTE_IDENTITY_NEEDS_VERIFICATION,
    buildEventProperties("KO", "screen_view")
  );
};

export const trackItwRemoteUntrustedRP = () => {
  void mixpanelTrack(
    ITW_REMOTE_ERRORS_EVENTS.ITW_REMOTE_RP_NOT_TRUSTED,
    buildEventProperties("KO", "screen_view")
  );
};

export const trackItwRemoteRequestObjectFailure = ({
  reason,
  type
}: ItwRemoteFailure) => {
  void mixpanelTrack(
    ITW_REMOTE_ERRORS_EVENTS.ITW_REMOTE_REQUEST_OBJECT_FAILURE,
    buildEventProperties("KO", "error", { reason, type })
  );
};

export const trackItwRemoteMandatoryCredentialMissing = ({
  missing_credential,
  missing_credential_number
}: ItwRemoteMissingCredential) => {
  void mixpanelTrack(
    ITW_REMOTE_ERRORS_EVENTS.ITW_REMOTE_MANDATORY_CREDENTIAL_MISSING,
    buildEventProperties("KO", "screen_view", {
      missing_credential,
      missing_credential_number
    })
  );
};

export const trackItwRemoteInvalidMandatoryCredential = ({
  not_valid_credential,
  not_valid_credential_number
}: ItwRemoteInvalidCredential) => {
  void mixpanelTrack(
    ITW_REMOTE_ERRORS_EVENTS.ITW_REMOTE_MANDATORY_CREDENTIAL_NOT_VALID,
    buildEventProperties("KO", "screen_view", {
      not_valid_credential,
      not_valid_credential_number
    })
  );
};

export const trackItwRemoteRPInvalidAuthResponse = ({
  reason,
  type
}: ItwRemoteFailure) => {
  void mixpanelTrack(
    ITW_REMOTE_ERRORS_EVENTS.ITW_REMOTE_INVALID_AUTH_RESPONSE,
    buildEventProperties("KO", "screen_view", { reason, type })
  );
};

export const trackItwRemoteRPGenericFailure = ({
  reason,
  type
}: ItwRemoteFailure) => {
  void mixpanelTrack(
    ITW_REMOTE_ERRORS_EVENTS.ITW_REMOTE_GENERIC_FAILURE,
    buildEventProperties("KO", "screen_view", { reason, type })
  );
};

export const trackItwRemoteDeepLinkFailure = (reason: Error) => {
  void mixpanelTrack(
    ITW_REMOTE_ERRORS_EVENTS.ITW_REMOTE_LINK_FAILURE,
    buildEventProperties("KO", "screen_view", { reason })
  );
};

export const trackItwUpgradeL3Mandatory = (action: ItwL3UpgradeTrigger) => {
  void mixpanelTrack(
    ITW_REMOTE_ERRORS_EVENTS.ITW_UPGRADE_L3_MANDATORY,
    buildEventProperties("KO", "screen_view", { action })
  );
};
// #endregion ERRORS

// #region TECH

export const trackItwRemoteStart = () => {
  void mixpanelTrack(
    ITW_REMOTE_TECH_EVENTS.ITW_REMOTE_START,
    buildEventProperties("TECH", undefined)
  );
};

// #endregion TECH
