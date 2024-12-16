export const receiptsCategoryFilters = ["all", "payer", "debtor"] as const;
export type ReceiptsCategoryFilter = (typeof receiptsCategoryFilters)[number];
