import { mixpanelTrack } from "../../../../../mixpanel";
import { buildEventProperties } from "../../../../../utils/analytics";
import {
  ITW_PROXIMITY_ACTIONS_EVENTS,
  ITW_PROXIMITY_ERRORS_EVENTS,
  ITW_PROXIMITY_SCREENVIEW_EVENTS
} from "./enum";

type ItwProximityFailure = {
  reason: unknown;
  type: string;
};

type ItwProximityGenericFailure = ItwProximityFailure & {
  proximity_sharing_status: "pre" | "post";
};

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

export const trackItwProximityQrCode = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_PROXIMITY_QR_CODE,
    buildEventProperties("UX", "screen_view")
  );
};

export const trackItwProximityDataShare = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_PROXIMITY_DATA_SHARE,
    buildEventProperties("UX", "screen_view")
  );
};

export const trackItwProximityPresentationCompleted = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_PROXIMITY_UX_SUCCESS,
    buildEventProperties("UX", "screen_view")
  );
};

export function trackItwProximityUnofficialVerifierBottomSheet() {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_PROXIMITY_UNOFFICIAL_VERIFIER_BOTTOMSHEET,
    buildEventProperties("UX", "screen_view")
  );
}

// Actions events

export const trackItwProximityShowQrCode = () => {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_PROXIMITY_SHOW_QR_CODE,
    buildEventProperties("UX", "action")
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

export function trackItwProximityContinuePresentation() {
  void mixpanelTrack(
    ITW_PROXIMITY_ACTIONS_EVENTS.ITW_PROXIMITY_UX_CONVERSION,
    buildEventProperties("UX", "action")
  );
}

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
  reason,
  type
}: ItwProximityFailure) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ERRORS_EVENTS.ITW_PROXIMITY_UNEXPECTED_FAILURE,
    buildEventProperties("KO", "screen_view", { reason, type })
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
