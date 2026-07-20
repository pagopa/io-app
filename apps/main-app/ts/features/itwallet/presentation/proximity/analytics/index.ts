import { mixpanelTrack } from "../../../../../mixpanel";
import { buildEventProperties } from "../../../../../utils/analytics";
import { MixPanelCredential } from "../../../analytics/utils/types";
import {
  ITW_PROXIMITY_ACTIONS_EVENTS,
  ITW_PROXIMITY_ERRORS_EVENTS,
  ITW_PROXIMITY_SCREENVIEW_EVENTS,
  ITW_PROXIMITY_TECH_EVENTS
} from "./enum";
import {
  ItwProximityFailure,
  ItwProximityFlowProperties,
  ItwProximityGenericFailure,
  ItwProximityQrCode,
  ItwProximityShowQrCode,
  ItwStartReissuingPID
} from "./types";

// Screen view events

export const trackItwProximityBluetoothBlock = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_BLUETOOTH_BLOCK,
    buildEventProperties("UX", "screen_view")
  );
};

export const trackItwProximityBluetoothAccess = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_BLUETOOTH_ACCESS,
    buildEventProperties("UX", "screen_view")
  );
};

export const trackItwProximityBluetoothAccessDenied = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_BLUETOOTH_ACCESS_DENIED,
    buildEventProperties("UX", "screen_view")
  );
};

export const trackItwProximityBluetoothActivation = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_BLUETOOTH_ACTIVATION,
    buildEventProperties("UX", "screen_view")
  );
};

export const trackItwProximityBluetoothNotActivated = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_BLUETOOTH_NOT_ACTIVATED,
    buildEventProperties("UX", "screen_view")
  );
};

/** Tracks the consent-management list screen for a credential. */
export const trackItwConsentManagement = ({
  credential
}: {
  credential: MixPanelCredential;
}) => {
  void mixpanelTrack(
    ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_CONSENT_MANAGEMENT,
    buildEventProperties("UX", "screen_view", { credential })
  );
};

/** Tracks the saved-consent detail screen. */
export const trackItwConsentManagementDetail = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_CONSENT_MANAGEMENT_DETAIL,
    buildEventProperties("UX", "screen_view")
  );
};

/** Tracks the revoke-confirmation alert impression. */
export const trackItwRevokeConsentOperationBlock = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_REVOKE_CONSENT_OPERATION_BLOCK,
    buildEventProperties("UX", "screen_view")
  );
};

export const trackItwProximityQrCode = ({
  source,
  qr_code_status
}: ItwProximityQrCode) => {
  void mixpanelTrack(
    ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_PROXIMITY_QR_CODE,
    buildEventProperties("UX", "screen_view", { source, qr_code_status })
  );
};

export const trackItwProximityDataShare = ({
  proximity_flow
}: ItwProximityFlowProperties) => {
  void mixpanelTrack(
    ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_PROXIMITY_DATA_SHARE,
    buildEventProperties("UX", "screen_view", { proximity_flow })
  );
};

export const trackItwProximityPresentationCompleted = ({
  proximity_flow
}: ItwProximityFlowProperties) => {
  void mixpanelTrack(
    ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_PROXIMITY_UX_SUCCESS,
    buildEventProperties("UX", "screen_view", { proximity_flow })
  );
};

export const trackItwProximityUnofficialVerifierBottomSheet = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_PROXIMITY_UNOFFICIAL_VERIFIER_BOTTOMSHEET,
    buildEventProperties("UX", "screen_view")
  );
};

// Actions events

export const trackItwProximityShowQrCode = ({
  credential,
  position
}: ItwProximityShowQrCode) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_PROXIMITY_SHOW_QR_CODE,
    buildEventProperties("UX", "action", { credential, position })
  );
};

/** Tracks access to consent management from credential details. */
export const trackItwCredentialManageConsent = ({
  credential
}: {
  credential: MixPanelCredential;
}) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_CREDENTIAL_MANAGE_CONSENT,
    buildEventProperties("UX", "action", { credential })
  );
};

/** Tracks the request to revoke a saved consent. */
export const trackItwRevokeConsent = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_REVOKE_CONSENT,
    buildEventProperties("UX", "action")
  );
};

/** Tracks the action selected in the revoke-confirmation alert. */
export const trackItwRevokeConsentOperationBlockAction = (
  user_action: string
) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_REVOKE_CONSENT_OPERATION_BLOCK_ACTION,
    buildEventProperties("UX", "action", { user_action })
  );
};

export const trackItwProximityBluetoothBlockAction = (user_action: string) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_BLUETOOTH_BLOCK_ACTION,
    buildEventProperties("UX", "action", { user_action })
  );
};

export const trackItwProximityBluetoothAccessGoToSettings = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_BLUETOOTH_ACCESS_GO_TO_SETTINGS,
    buildEventProperties("UX", "action")
  );
};

export const trackItwProximityBluetoothAccessClose = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_BLUETOOTH_ACCESS_CLOSE,
    buildEventProperties("UX", "action")
  );
};

export const trackItwProximityBluetoothActivationClose = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_BLUETOOTH_ACTIVATION_CLOSE,
    buildEventProperties("UX", "action")
  );
};

export const trackItwProximityBluetoothActivationGoToSettings = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_BLUETOOTH_ACTIVATION_GO_TO_SETTINGS,
    buildEventProperties("UX", "action")
  );
};

export const trackItwProximityQrCodeLoadingRetry = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_PROXIMITY_QR_CODE_LOADING_RETRY,
    buildEventProperties("UX", "action")
  );
};

export const trackItwProximityContinuePresentation = ({
  proximity_flow
}: ItwProximityFlowProperties) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_PROXIMITY_UX_CONVERSION,
    buildEventProperties("UX", "action", { proximity_flow })
  );
};

export const trackItwProximityNfcStart = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_PROXIMITY_NFC_START,
    buildEventProperties("UX", "action")
  );
};

export const trackItwStartReissuingPID = ({
  position
}: ItwStartReissuingPID) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_START_REISSUING_PID,
    buildEventProperties("UX", "action", { position })
  );
};

// Errors events

export const trackItwProximityQrCodeLoadingFailure = ({
  reason,
  type
}: ItwProximityFailure) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ERRORS_EVENTS.ITW_PROXIMITY_QR_CODE_LOADING_FAILURE,
    buildEventProperties("KO", "screen_view", { reason, type })
  );
};

export const trackItwProximityRPGenericFailure = ({
  proximity_sharing_status,
  reason,
  type
}: ItwProximityGenericFailure) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ERRORS_EVENTS.ITW_PROXIMITY_GENERIC_ERROR,
    buildEventProperties("KO", "screen_view", {
      proximity_sharing_status,
      reason,
      type
    })
  );
};

export const trackItwProximityTimeout = ({
  reason,
  type
}: ItwProximityFailure) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ERRORS_EVENTS.ITW_PROXIMITY_TIMEOUT,
    buildEventProperties("KO", "screen_view", { reason, type })
  );
};

export const trackItwProximityUnexpectedFailure = ({
  origin,
  reason,
  type
}: ItwProximityFailure) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ERRORS_EVENTS.ITW_PROXIMITY_UNEXPECTED_FAILURE,
    buildEventProperties("KO", "screen_view", { origin, reason, type })
  );
};

export const trackItwProximityUnofficialVerifier = ({
  reason,
  type
}: ItwProximityFailure) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ERRORS_EVENTS.ITW_PROXIMITY_UNOFFICIAL_VERIFIER,
    buildEventProperties("KO", "screen_view", { reason, type })
  );
};

// Tech events

export const trackItwProximityStart = ({
  proximity_flow
}: ItwProximityFlowProperties) => {
  void mixpanelTrack(
    ITW_PROXIMITY_TECH_EVENTS.ITW_PROXIMITY_START,
    buildEventProperties("TECH", undefined, { proximity_flow })
  );
};
