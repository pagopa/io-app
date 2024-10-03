import { mixpanelTrack } from "../../../mixpanel";

export function trackIngressServicesSlowDown() {
  void mixpanelTrack("INGRESS_SERVICES_SLOW_DOWN");
}

export function trackIngressTimeout() {
  void mixpanelTrack("INGRESS_TIMEOUT");
}

export function trackIngressCdnSystemError() {
  void mixpanelTrack("INGRESS_CDN_SYSTEM_ERROR");
}
