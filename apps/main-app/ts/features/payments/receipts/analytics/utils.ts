import { PaymentAnalyticsData } from "../../common/types/PaymentAnalytics";
import * as analytics from "../analytics";

export const analyticsHideReceiptAction = (
  paymentAnalyticsData?: PaymentAnalyticsData,
  trigger?: analytics.HideReceiptTrigger
) =>
  analytics.trackHideReceipt({
    organization_name: paymentAnalyticsData?.receiptOrganizationName,
    first_time_opening: paymentAnalyticsData?.receiptFirstTimeOpening,
    user: paymentAnalyticsData?.receiptUser,
    organization_fiscal_code:
      paymentAnalyticsData?.receiptOrganizationFiscalCode,
    trigger
  });

export const analyticsHideReceiptConfirmAction = (
  paymentAnalyticsData?: PaymentAnalyticsData,
  trigger?: analytics.HideReceiptTrigger
) =>
  analytics.trackHideReceiptConfirm({
    organization_name: paymentAnalyticsData?.receiptOrganizationName,
    first_time_opening: paymentAnalyticsData?.receiptFirstTimeOpening,
    user: paymentAnalyticsData?.receiptUser,
    organization_fiscal_code:
      paymentAnalyticsData?.receiptOrganizationFiscalCode,
    trigger
  });
