import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";
import { ITW_ROUTES } from "../../itwallet/navigation/routes";

export function trackIngressServicesSlowDown() {
  void mixpanelTrack(
    "INGRESS_SERVICES_SLOW_DOWN",
    buildEventProperties("KO", undefined)
  );
}

export function trackIngressTimeout() {
  void mixpanelTrack("INGRESS_TIMEOUT", buildEventProperties("KO", undefined));
}

export function trackIngressCdnSystemError() {
  void mixpanelTrack(
    "INGRESS_CDN_SYSTEM_ERROR",
    buildEventProperties("KO", undefined)
  );
}

export function trackIngressNoInternetConnection() {
  void mixpanelTrack(
    "INGRESS_NO_INTERNET_CONNECTION",
    buildEventProperties("KO", undefined)
  );
}

// Offline wallet banner tracking
const props = {
  banner_id: "INGRESS_SCREEN_WALLET_OFFLINE",
  banner_page: ITW_ROUTES.OFFLINE.WALLET,
  banner_landing: "INGRESS_SCREEN"
};

export function trackSettingsDiscoverBannerVisualized() {
  const eventName = "BANNER";
  const buildedProps = buildEventProperties("UX", "screen_view", props);
  void mixpanelTrack(eventName, buildedProps);
}

export function trackIngressOfflineWalletBannerCTAClicked() {
  const eventName = "TAP_BANNER";
  const buildedProps = buildEventProperties("UX", "action", props);
  void mixpanelTrack(eventName, buildedProps);
}
