import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { ItwOfflineRicaricaAppIOSource } from "./types";
import {
  ITW_OFFLINE_ACTIONS_EVENTS,
  ITW_OFFLINE_ERRORS_EVENTS,
  ITW_OFFLINE_SCREENVIEW_EVENTS
} from "./enum";

// #region SCREEN VIEW EVENTS

export const trackItwOfflineWallet = () => {
  void mixpanelTrack(
    ITW_OFFLINE_SCREENVIEW_EVENTS.ITW_OFFLINE_WALLET,
    buildEventProperties("UX", "screen_view")
  );
};

export const trackItwOfflineBottomSheet = () => {
  void mixpanelTrack(
    ITW_OFFLINE_SCREENVIEW_EVENTS.ITW_OFFLINE_BOTTOM_SHEET,
    buildEventProperties("UX", "screen_view")
  );
};

export const trackItwOfflineAccessExpiring = () => {
  void mixpanelTrack(
    ITW_OFFLINE_SCREENVIEW_EVENTS.ITW_OFFLINE_ACCESS_EXPIRING,
    buildEventProperties("UX", "screen_view")
  );
};

export const trackItwOfflineAccessExpired = () => {
  void mixpanelTrack(
    ITW_OFFLINE_SCREENVIEW_EVENTS.ITW_OFFLINE_ACCESS_EXPIRED,
    buildEventProperties("KO", "screen_view")
  );
};

// #endregion SCREEN VIEW EVENTS

// #region ACTIONS

export const trackItwOfflineRicaricaAppIO = (
  source: ItwOfflineRicaricaAppIOSource
) => {
  void mixpanelTrack(
    ITW_OFFLINE_ACTIONS_EVENTS.ITW_OFFLINE_RICARICA_APP_IO,
    buildEventProperties("UX", "action", {
      source
    })
  );
};

// #endregion ACTIONS

// #region ERRORS

export const trackItwOfflineReloadFailure = () => {
  void mixpanelTrack(
    ITW_OFFLINE_ERRORS_EVENTS.ITW_OFFLINE_RELOAD_FAILURE,
    buildEventProperties("KO", "error")
  );
};

// #endregion ERRORS
