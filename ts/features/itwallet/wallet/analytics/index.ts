import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { ItwOfflineRicaricaAppIOSource } from "./types";
import {
  ITW_OFFLINE_ACTIONS_EVENTS,
  ITW_OFFLINE_ERRORS_EVENTS,
  ITW_OFFLINE_SCREENVIEW_EVENTS
} from "./enum";

// Screen view events

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

// Actions events

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

// Errors events

export const trackItwOfflineReloadFailure = () => {
  void mixpanelTrack(
    ITW_OFFLINE_ERRORS_EVENTS.ITW_OFFLINE_RELOAD_FAILURE,
    buildEventProperties("KO", "error")
  );
};
