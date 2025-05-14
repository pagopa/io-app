import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import { WalletInfo as EcommerceWalletInfo } from "../../../../../definitions/pagopa/ecommerce/WalletInfo";
import { PaymentRequestsGetResponse } from "../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { Bundle } from "../../../../../definitions/pagopa/ecommerce/Bundle";
import { PaymentStartOrigin } from "../../checkout/types";

export type PaymentAnalyticsData = {
  savedPaymentMethods?: ReadonlyArray<WalletInfo | EcommerceWalletInfo>;
  savedPaymentMethodsUnavailable?: ReadonlyArray<
    WalletInfo | EcommerceWalletInfo
  >;
  pspList?: ReadonlyArray<Bundle>;
  selectedPsp?: string;
  selectedPspFlag?: PaymentAnalyticsSelectedPspFlag;
  selectedPaymentMethod?: string;
  formattedAmount?: string;
  serviceName?: string;
  startOrigin?: PaymentStartOrigin;
  verifiedData?: PaymentRequestsGetResponse;
  attempt?: number;
  paymentsHomeStatus?: PaymentsAnalyticsHomeStatus;
  transactionsHomeLength?: number;
  receiptUser?: PaymentsAnalyticsReceiptUser;
  receiptFirstTimeOpening?: boolean;
  receiptFirstTimeOpeningPDF?: boolean;
  receiptOrganizationName?: string;
  receiptOrganizationFiscalCode?: string;
  receiptPayerFiscalCode?: string;
  browserType?: PaymentAnalyticsBrowserType;
};

export type PaymentsAnalyticsReceiptUser = "payee" | "payer";

export type PaymentsAnalyticsHomeAddWalletEntryPoint =
  | "wallet_home"
  | "payments_home";

export type PaymentsAnalyticsHomeStatus =
  | "empty"
  | "empty receipts"
  | "empty method"
  | "complete";

export type PaymentAnalyticsSelectedMethodFlag = "none" | "last_used" | "saved";

export type PaymentAnalyticsPreselectedPspFlag =
  | "none"
  | "cheaper"
  | "customer";

export type PaymentAnalyticsSelectedPspFlag =
  | PaymentAnalyticsPreselectedPspFlag
  | "unique";

export type PaymentAnalyticsEditingType = "payment_method" | "psp";

export type PaymentAnalyticsPhase = "verifica" | "attiva" | "pagamento";

export type PaymentAnalyticsBrowserType = "webview" | "inapp_browser";
