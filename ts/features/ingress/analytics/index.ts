import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

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
