import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

// PROPERTIES TYPES
type TrackWalletAddStart = {
  wallet_item:
    | "ITW_ID"
    | "ITW_PG"
    | "ITW_CED"
    | "ITW_TS"
    | "CGN"
    | "welfare"
    | "payment_method";
};

// SCREEN VIEW EVENTS
export function trackWalletScreenWallet() {
  void mixpanelTrack("WALLET", buildEventProperties("UX", "screen_view"));
}

export function trackWalletAddListItem() {
  void mixpanelTrack(
    "WALLET_ADD_LIST_ITEM",
    buildEventProperties("UX", "screen_view")
  );
}

// ACTIONS EVENTS
export function trackWalletAdd() {
  void mixpanelTrack("WALLET_ADD", buildEventProperties("UX", "action"));
}

export function trackWalletAddStart(properties: TrackWalletAddStart) {
  void mixpanelTrack(
    "WALLET_ADD_START",
    buildEventProperties("UX", "action", {
      ...properties,
      payment_home_status: "not_set",
      add_entry_point: "wallet_home"
    })
  );
}
