import { mixpanelTrack } from "../../../../../mixpanel";
import { buildEventProperties } from "../../../../../utils/analytics";
import {
  CREDENTIALS_MAP,
  ItwScreenFlowContext,
  MixPanelCredential,
  MixPanelCredentialVersion
} from "../../../analytics";
import { ITW_ERRORS_EVENTS } from "../../../analytics/enum";
import { RemoteFailureType } from "../machine/failure";
import {
  ITW_REMOTE_ACTIONS_EVENTS,
  ITW_REMOTE_ERRORS_EVENTS,
  ITW_REMOTE_SCREENVIEW_EVENTS
} from "./enum";

type ItwRemoteFailure = {
  reason: unknown;
  type: string;
};

type ItwRemoteMissingCredential = {
  missing_credential: string;
  missing_credential_number: number;
};

type ItwRemoteInvalidCredential = {
  not_valid_credential: string;
  not_valid_credential_number: number;
};

type ItwRemoteDataShare = {
  data_type: "required" | "optional";
  request_type: "unique_purpose" | "multiple_purpose" | "no_purpose";
};

// Type guard to check if an unknown object is a Record of MixPanelCredentialVersion to MixPanelCredential
const isCredentialRecord = (
  c: unknown
): c is Record<MixPanelCredentialVersion, MixPanelCredential> =>
  typeof c === "object" && c !== null && "V3" in c;

// Screen view events

export function trackItwRemoteUntrustedRPBottomSheet() {
  void mixpanelTrack(
    ITW_REMOTE_SCREENVIEW_EVENTS.ITW_REMOTE_RP_NOT_TRUSTED_BOTTOMSHEET,
    buildEventProperties("UX", "screen_view")
  );
}

export const trackItwRemoteDataShare = ({
  data_type,
  request_type
}: ItwRemoteDataShare) => {
  void mixpanelTrack(
    ITW_REMOTE_SCREENVIEW_EVENTS.ITW_REMOTE_DATA_SHARE,
    buildEventProperties("UX", "screen_view", { data_type, request_type })
  );
};

export function trackItwRemoteInvalidAuthResponseBottomSheet() {
  void mixpanelTrack(
    ITW_REMOTE_SCREENVIEW_EVENTS.ITW_REMOTE_INVALID_AUTH_RESPONSE_BOTTOMSHEET,
    buildEventProperties("UX", "screen_view")
  );
}

export function trackItwRemotePresentationCompleted(redirect_url: boolean) {
  void mixpanelTrack(
    ITW_REMOTE_SCREENVIEW_EVENTS.ITW_REMOTE_UX_SUCCESS,
    buildEventProperties("UX", "screen_view", { redirect_url })
  );
}

// Actions events

export function trackItwRemoteContinuePresentation() {
  void mixpanelTrack(
    ITW_REMOTE_ACTIONS_EVENTS.ITW_REMOTE_UX_CONVERSION,
    buildEventProperties("UX", "action")
  );
}

// Errors events

export const trackItwRemoteUnexpectedFailure = ({
  reason,
  type
}: ItwRemoteFailure) => {
  void mixpanelTrack(
    ITW_REMOTE_ERRORS_EVENTS.ITW_REMOTE_UNEXPECTED_FAILURE,
    buildEventProperties("KO", "error", { reason, type })
  );
};

export function trackItwRemoteIdentityNeedsVerification() {
  void mixpanelTrack(
    ITW_REMOTE_ERRORS_EVENTS.ITW_REMOTE_IDENTITY_NEEDS_VERIFICATION,
    buildEventProperties("KO", "screen_view")
  );
}

export function trackItwRemoteUntrustedRP() {
  void mixpanelTrack(
    ITW_REMOTE_ERRORS_EVENTS.ITW_REMOTE_RP_NOT_TRUSTED,
    buildEventProperties("KO", "screen_view")
  );
}

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

/**
 * Returns a string of missing or invalid credentials formatted for tracking,
 * ordered according to a predefined priority.
 *
 * It checks which credentials from a predefined list (CREDENTIALS_MAP)
 * are included in the input array, maps them to their Mixpanel names,
 * and joins them with " - ".
 *
 * Example:
 * Input: ["mDL", "EuropeanHealthInsuranceCard"]
 * Output: "ITW_PG_V3 - ITW_TS_V3"
 */
export const getOrderedCredential = (
  missingCredentials: Array<string>
): string =>
  Object.keys(CREDENTIALS_MAP)
    .filter(credentialType => missingCredentials.includes(credentialType))
    .map(credentialType => CREDENTIALS_MAP[credentialType])
    .filter(isCredentialRecord)
    .map(credential => credential.V3)
    .join(" - ");

/**
 * Returns the dismiss context for a given failure type.
 * This is used to determine which screen and flow to show when a failure occurs.
 * @param failureType - The type of failure that occurred
 * @returns An ItwDismissalContext object or undefined if no dismiss context is defined for the failure type
 */
export const getDismissalContextFromFailure = (
  failureType: RemoteFailureType
): ItwScreenFlowContext | undefined => {
  switch (failureType) {
    case RemoteFailureType.WALLET_INACTIVE:
      return {
        screen_name: ITW_ERRORS_EVENTS.ITW_UPGRADE_L3_MANDATORY,
        itw_flow: "not_available"
      };
    case RemoteFailureType.MISSING_CREDENTIALS:
      return {
        screen_name:
          ITW_REMOTE_ERRORS_EVENTS.ITW_REMOTE_MANDATORY_CREDENTIAL_MISSING,
        itw_flow: "not_available"
      };
    default:
      return undefined;
  }
};
