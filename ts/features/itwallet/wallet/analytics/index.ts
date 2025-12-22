import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { ITW_OFFLINE_SCREENVIEW_EVENTS } from "./enum";

export function trackItwOfflineWallet() {
  void mixpanelTrack(
    ITW_OFFLINE_SCREENVIEW_EVENTS.ITW_OFFLINE_WALLET,
    buildEventProperties("UX", "screen_view")
  );
}

export function trackItwOfflineBottomSheet() {
  void mixpanelTrack(
    ITW_OFFLINE_SCREENVIEW_EVENTS.ITW_OFFLINE_BOTTOM_SHEET,
    buildEventProperties("UX", "screen_view")
  );
}

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
