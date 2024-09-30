import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import {
  PaymentsAnalyticsHomeAddWalletEntryPoint,
  PaymentsAnalyticsHomeStatus
} from "../../common/types/PaymentAnalytics";

export type PaymentHomeAnalyticsProps = {
  payments_home_status: PaymentsAnalyticsHomeStatus;
  saved_payment_method: number;
  wallet_item: "payment_method";
  add_entry_point: PaymentsAnalyticsHomeAddWalletEntryPoint;
};

export const trackPaymentsHome = (
  props: Partial<PaymentHomeAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENTS_HOME",
    buildEventProperties("UX", "screen_view", { ...props })
  );
};

export const trackPaymentsOpenReceiptListing = () => {
  void mixpanelTrack(
    "OPEN_RECEIPT_LISTING",
    buildEventProperties("UX", "action")
  );
};

export const trackPaymentsOpenOldReceiptListing = (
  entryPoint: "payments_home" | "payments_receipt_listing"
) => {
  void mixpanelTrack(
    "OPEN_RECEIPT_OLD_LISTING",
    buildEventProperties("UX", "action", {
      entry_point: entryPoint
    })
  );
};

export const trackPaymentStartDataEntry = (
  props: Partial<PaymentHomeAnalyticsProps>
) => {
  void mixpanelTrack(
    "PAYMENT_START_DATA_ENTRY",
    buildEventProperties("UX", "action", {
      ...props
    })
  );
};

export const trackPaymentWalletAddStart = (
  props: Partial<PaymentHomeAnalyticsProps>
) => {
  void mixpanelTrack(
    "WALLET_ADD_START",
    buildEventProperties("UX", "action", {
      ...props
    })
  );
};
