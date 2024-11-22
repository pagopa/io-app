import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { PaymentsAnalyticsReceiptUser } from "../../common/types/PaymentAnalytics";

export type PaymentReceiptAnalyticsProps = {
  organization_name: string;
  payment_status: string;
  first_time_opening: boolean;
  user: PaymentsAnalyticsReceiptUser;
};

export const trackPaymentsReceiptListing = () => {
  void mixpanelTrack(
    "PAYMENTS_RECEIPT_LISTING",
    buildEventProperties("UX", "screen_view")
  );
};

export const trackPaymentsOpenOldReceiptListing = (
  entryPoint: "payments_receipt_listing"
) => {
  void mixpanelTrack(
    "OPEN_RECEIPT_OLD_LISTING",
    buildEventProperties("UX", "action", {
      entry_point: entryPoint
    })
  );
};

export const trackPaymentsOpenReceipt = (
  props: Partial<PaymentReceiptAnalyticsProps>
) => {
  void mixpanelTrack(
    "OPEN_RECEIPT",
    buildEventProperties("UX", "screen_view", {
      ...props
    })
  );
};

export const trackPaymentsDownloadReceiptAction = (
  props: Partial<PaymentReceiptAnalyticsProps>
) => {
  void mixpanelTrack(
    "DOWNLOAD_RECEIPT",
    buildEventProperties("UX", "action", {
      ...props
    })
  );
};

export const trackPaymentsOpenSubReceipt = () => {
  void mixpanelTrack(
    "OPEN_SUB_RECEIPT",
    buildEventProperties("UX", "screen_view")
  );
};

export const trackPaymentsSaveAndShareReceipt = () => {
  void mixpanelTrack(
    "SAVE_AND_SHARE_RECEIPT",
    buildEventProperties("UX", "action", {
      receipt_entry_point: "payments_receipt_listing"
    })
  );
};

export const trackPaymentsDownloadReceiptError = (
  props: Partial<PaymentReceiptAnalyticsProps>
) => {
  void mixpanelTrack(
    "DOWNLOAD_RECEIPT_FAILURE",
    buildEventProperties("KO", undefined, {
      ...props
    })
  );
};

export const trackHideReceipt = (
  props: Partial<PaymentReceiptAnalyticsProps>
) => {
  void mixpanelTrack(
    "HIDE_RECEIPT",
    buildEventProperties("UX", "action", props)
  );
};

export const trackHideReceiptConfirm = (
  props: Partial<PaymentReceiptAnalyticsProps>
) => {
  void mixpanelTrack(
    "HIDE_RECEIPT_CONFIRM",
    buildEventProperties("UX", "action", props)
  );
};

export const trackHideReceiptSuccess = (
  props: Partial<PaymentReceiptAnalyticsProps>
) => {
  void mixpanelTrack(
    "HIDE_RECEIPT_SUCCESS",
    buildEventProperties("UX", "screen_view", props)
  );
};

export const trackHideReceiptFailure = (
  props: Partial<PaymentReceiptAnalyticsProps>
) => {
  void mixpanelTrack(
    "HIDE_RECEIPT_FAILURE",
    buildEventProperties("KO", undefined, props)
  );
};
