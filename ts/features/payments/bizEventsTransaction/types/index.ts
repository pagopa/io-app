export const paymentsBizEventsCategoryFilters = [
  "all",
  "payer",
  "debtor"
] as const;
export type PaymentBizEventsCategoryFilter =
  (typeof paymentsBizEventsCategoryFilters)[number];
