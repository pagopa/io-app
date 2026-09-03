import { mixpanelTrack } from "../../../../../mixpanel";
import { buildEventProperties } from "../../../../../utils/analytics";
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
  ItwProximityHttpFailure,
  ItwProximityMandatoryCredentialMissing,
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

export const trackItwProximityRpNotTrustedBottomSheet = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_PROXIMITY_RP_NOT_TRUSTED_BOTTOMSHEET,
    buildEventProperties("UX", "screen_view")
  );
};

export const trackItwProximitySavePreferences = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_PROXIMITY_SAVE_PREFERENCES,
    buildEventProperties("UX", "screen_view")
  );
};

export const trackItwProximityRpNotTrustedDiscoverMore = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_PROXIMITY_RP_NOT_TRUSTED_DISCOVER_MORE,
    buildEventProperties("UX", "action")
  );
};

export const trackItwProximityNfcActivation = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_PROXIMITY_NFC_ACTIVATION,
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

export const trackItwProximityNfcActivationClose = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_PROXIMITY_NFC_ACTIVATION_CLOSE,
    buildEventProperties("UX", "action")
  );
};

export const trackItwProximityNfcGoToSettings = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_PROXIMITY_NFC_GO_TO_SETTINGS,
    buildEventProperties("UX", "action")
  );
};

export const trackItwProximitySavePreferencesConfirm = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_PROXIMITY_SAVE_PREFERENCES_CONFIRM,
    buildEventProperties("UX", "action")
  );
};

export const trackItwProximitySavePreferencesDismiss = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_PROXIMITY_SAVE_PREFERENCES_DISMISS,
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

export const trackItwProximityNfcSessionError = ({
  reason,
  type
}: ItwProximityFailure) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ERRORS_EVENTS.ITW_PROXIMITY_NFC_SESSION_ERROR,
    buildEventProperties("KO", "screen_view", { reason, type })
  );
};

export const trackItwProximityNfcSessionTimeout = ({
  reason,
  type
}: ItwProximityFailure) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ERRORS_EVENTS.ITW_PROXIMITY_NFC_SESSION_TIMEOUT,
    buildEventProperties("KO", "screen_view", { reason, type })
  );
};

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

export const trackItwProximityRpNotTrusted = ({
  reason,
  type
}: ItwProximityFailure) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ERRORS_EVENTS.ITW_PROXIMITY_RP_NOT_TRUSTED,
    buildEventProperties("KO", "screen_view", { reason, type })
  );
};

export const trackItwProximityRequestObjectFailure = ({
  reason
}: ItwProximityHttpFailure) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ERRORS_EVENTS.ITW_PROXIMITY_REQUEST_OBJECT_FAILURE,
    buildEventProperties("KO", "screen_view", { reason })
  );
};

export const trackItwProximityMandatoryCredentialMissing = ({
  missing_credential,
  missing_credential_number
}: ItwProximityMandatoryCredentialMissing) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ERRORS_EVENTS.ITW_PROXIMITY_MANDATORY_CREDENTIAL_MISSING,
    buildEventProperties("KO", "screen_view", {
      missing_credential,
      missing_credential_number
    })
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
