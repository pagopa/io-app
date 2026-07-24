import { Bundle } from "../../../../../definitions/pagopa/ecommerce/Bundle";
import { PaymentRequestsGetResponse } from "../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { WalletInfo as EcommerceWalletInfo } from "../../../../../definitions/pagopa/ecommerce/WalletInfo";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import { PaymentStartOrigin } from "../../checkout/types";

export type PaymentAnalyticsBrowserType = "inapp_browser" | "webview";

export type PaymentAnalyticsData = {
  attempt?: number;
  browserType?: PaymentAnalyticsBrowserType;
  formattedAmount?: string;
  is_onboarded?: boolean;
  paymentsHomeStatus?: PaymentsAnalyticsHomeStatus;
  pspList?: ReadonlyArray<Bundle>;
  receiptEventId?: string;
  receiptFirstTimeOpening?: boolean;
  receiptFirstTimeOpeningPDF?: boolean;
  receiptOrganizationFiscalCode?: string;
  receiptOrganizationName?: string;
  receiptPayerFiscalCode?: string;
  receiptUser?: PaymentsAnalyticsReceiptUser;
  savedPaymentMethods?: ReadonlyArray<EcommerceWalletInfo | WalletInfo>;
  savedPaymentMethodsUnavailable?: ReadonlyArray<
    EcommerceWalletInfo | WalletInfo
  >;
  selectedPaymentMethod?: string;
  selectedPsp?: string;
  selectedPspFlag?: PaymentAnalyticsPspFlag;
  serviceName?: string;
  startOrigin?: PaymentStartOrigin;
  transactionsHomeLength?: number;
  verifiedData?: PaymentRequestsGetResponse;
};

export type PaymentAnalyticsEditingType = "payment_method" | "psp";

export type PaymentAnalyticsPhase = "attiva" | "pagamento" | "verifica";

export type PaymentAnalyticsPspFlag =
  | "cheaper"
  | "customer"
  | "none"
  | "unique";

export type PaymentAnalyticsSelectedMethodFlag = "last_used" | "none" | "saved";

export type PaymentsAnalyticsHomeAddWalletEntryPoint =
  | "payments_home"
  | "wallet_home";

export type PaymentsAnalyticsHomeStatus =
  | "complete"
  | "empty"
  | "empty method"
  | "empty receipts";

export type PaymentsAnalyticsReceiptUser = "payee" | "payer";
