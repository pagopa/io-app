export const noticeEventsCategoryFilters = ["all", "payer", "debtor"] as const;
export type NoticeEventsCategoryFilter =
  (typeof noticeEventsCategoryFilters)[number];
