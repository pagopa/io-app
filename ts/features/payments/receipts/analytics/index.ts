import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { PaymentsAnalyticsReceiptUser } from "../../common/types/PaymentAnalytics";
import { ReceiptsCategoryFilter } from "../types";

export type HideReceiptTrigger = "tap" | "swipe";

type PaymentReceiptAnalyticsProps = {
  organization_name: string;
  payment_status: string;
  first_time_opening: boolean;
  user: PaymentsAnalyticsReceiptUser;
  organization_fiscal_code: string;
  trigger: HideReceiptTrigger;
  reason?: string;
};

export const trackPaymentsReceiptListing = () => {
  mixpanelTrack(
    "PAYMENTS_RECEIPT_LISTING",
    buildEventProperties("UX", "screen_view")
  );
};

export const trackPaymentsOpenReceipt = (
  props: Partial<PaymentReceiptAnalyticsProps>
) => {
  mixpanelTrack(
    "OPEN_RECEIPT",
    buildEventProperties("UX", "screen_view", {
      ...props,
      receipt_entry_point: "payments_receipt_listing"
    })
  );
};

export const trackPaymentsDownloadReceiptAction = (
  props: Partial<PaymentReceiptAnalyticsProps>
) => {
  mixpanelTrack(
    "DOWNLOAD_RECEIPT",
    buildEventProperties("UX", "action", {
      ...props
    })
  );
};

export const trackPaymentsOpenSubReceipt = () => {
  mixpanelTrack("OPEN_SUB_RECEIPT", buildEventProperties("UX", "screen_view"));
};

export const trackPaymentsSaveAndShareReceipt = (
  props: Partial<PaymentReceiptAnalyticsProps>
) => {
  mixpanelTrack(
    "SAVE_AND_SHARE_RECEIPT",
    buildEventProperties("UX", "action", {
      ...props,
      receipt_entry_point: "payments_receipt_listing"
    })
  );
};
export const trackPaymentsDownloadReceiptSuccess = (
  props: Partial<PaymentReceiptAnalyticsProps>
) => {
  mixpanelTrack(
    "DOWNLOAD_RECEIPT_SUCCESS",
    buildEventProperties("UX", "screen_view", {
      ...props
    })
  );
};

export const trackPaymentsDownloadReceiptError = (
  props: Partial<PaymentReceiptAnalyticsProps>
) => {
  mixpanelTrack(
    "DOWNLOAD_RECEIPT_FAILURE",
    buildEventProperties("KO", undefined, {
      ...props
    })
  );
};

export const trackHideReceipt = (
  props: Partial<PaymentReceiptAnalyticsProps>
) => {
  mixpanelTrack("HIDE_RECEIPT", buildEventProperties("UX", "action", props));
};

export const trackHideReceiptConfirm = (
  props: Partial<PaymentReceiptAnalyticsProps>
) => {
  mixpanelTrack(
    "HIDE_RECEIPT_CONFIRM",
    buildEventProperties("UX", "action", props)
  );
};

export const trackHideReceiptSuccess = (
  props: Partial<PaymentReceiptAnalyticsProps>
) => {
  mixpanelTrack(
    "HIDE_RECEIPT_SUCCESS",
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackHideReceiptFailure = (
  props: Partial<PaymentReceiptAnalyticsProps>
) => {
  mixpanelTrack(
    "HIDE_RECEIPT_FAILURE",
    buildEventProperties("KO", undefined, props)
  );
};

export const trackReceiptFilterUsage = (
  filter: Partial<ReceiptsCategoryFilter>
) => {
  mixpanelTrack(
    "PAYMENTS_RECEIPT_LISTING_FILTER",
    buildEventProperties("UX", "action", { filter })
  );
};
