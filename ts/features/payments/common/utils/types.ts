export type AlertVariant = "error" | "success" | "warning" | "info";

export type PaymentsBackoffRetryValue = {
  retryCount: number;
  allowedRetryTimestamp?: number;
};

export type ListItemTransactionStatus =
  | "success"
  | "failure"
  | "pending"
  | "cancelled"
  | "refunded"
  | "reversal";
