export type PaymentAnalyticsSelectedMethodFlag = "none" | "last_used" | "saved";

export type PaymentAnalyticsPreselectedPspFlag = "none" | "cheaper" | "customer";

export type PaymentAnalyticsSelectedPspFlag = PaymentAnalyticsPreselectedPspFlag | "unique";

export type PaymentAnalyticsEditingType = "payment_method" | "psp";
