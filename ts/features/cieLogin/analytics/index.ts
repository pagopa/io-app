import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

export type BarcodeAnalyticsFlow = "home" | "avviso" | "idpay"; // Should be extended for every feature
export type BarcodeAnalyticsCode = "avviso" | "data_matrix" | "idpay"; // Should be extended for every feature
export type BarcodeAnalyticsDataEntry = "qr code" | "file";

export const trackCieIdNoWhitelistUrl = (url: string) => {
  void mixpanelTrack(
    "LOGIN_CIEID_NO_WHITELIST_URL",
    buildEventProperties("KO", undefined, { url })
  );
};
