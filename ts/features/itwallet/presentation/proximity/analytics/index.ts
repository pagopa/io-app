import { mixpanelTrack } from "../../../../../mixpanel";
import { buildEventProperties } from "../../../../../utils/analytics";
import {
  ITW_PROXIMITY_ACTIONS_EVENTS,
  ITW_PROXIMITY_ERRORS_EVENTS,
  ITW_PROXIMITY_SCREENVIEW_EVENTS
} from "./enum";

type ItwProximityFailure = {
  reason: unknown;
};

type ItwProximityGenericFailure = ItwProximityFailure & {
  proximity_sharing_status: "pre" | "post";
};

// #region SCREEN VIEW EVENTS

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
    ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_PROXIMITY_SUCCESS,
    buildEventProperties("UX", "screen_view")
  );
};

// #endregion SCREEN VIEW EVENTS

// #region ACTIONS

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

// #endregion ACTIONS

// #region ERRORS

export const trackItwProximityQrCodeLoadingFailure = (
  reason: ItwProximityFailure
) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ERRORS_EVENTS.ITW_PROXIMITY_QR_CODE_LOADING_FAILURE,
    buildEventProperties("KO", "screen_view", { reason })
  );
};

export const trackItwProximityRPGenericFailure = (
  reason: ItwProximityGenericFailure
) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ERRORS_EVENTS.ITW_PROXIMITY_GENERIC_ERROR,
    buildEventProperties("KO", "screen_view", { reason })
  );
};

export const trackItwProximityTimeout = (reason: ItwProximityFailure) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ERRORS_EVENTS.ITW_PROXIMITY_TIMEOUT,
    buildEventProperties("KO", "screen_view", { reason })
  );
};

export const trackItwProximityUnexpectedFailure = (
  reason: ItwProximityFailure
) => {
  void mixpanelTrack(
    ITW_PROXIMITY_ERRORS_EVENTS.ITW_PROXIMITY_UNEXPECTED_FAILURE,
    buildEventProperties("KO", "screen_view", { reason })
  );
};

// #endregion ERRORS
