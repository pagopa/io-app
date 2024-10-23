export type AlertVariant = "error" | "success" | "warning" | "info";

export type PaymentsBackoffRetryValue = {
  retryCount: number;
  allowedRetryTimestamp?: number;
};
