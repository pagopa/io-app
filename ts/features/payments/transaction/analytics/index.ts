import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";

export const trackPaymentsReceiptOldListing = () => {
  void mixpanelTrack(
    "PAYMENTS_RECEIPT_OLD_LISTING",
    buildEventProperties("UX", "screen_view")
  );
};

export const trackPaymentsReceiptOldListingInfo = () => {
  void mixpanelTrack(
    "PAYMENTS_RECEIPT_OLD_LISTING_INFO",
    buildEventProperties("UX", "action")
  );
};
