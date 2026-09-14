export type AlertVariant = "error" | "info" | "success" | "warning";

export type ListItemTransactionStatus =
  | "cancelled"
  | "failure"
  | "pending"
  | "refunded"
  | "reversal"
  | "success";

export type PaymentsBackoffRetryValue = {
  allowedRetryTimestamp?: number;
  retryCount: number;
};
