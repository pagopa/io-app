import { ProblemJson } from "../../../../../definitions/pagopa/biz-events/ProblemJson";

export const receiptsCategoryFilters = ["all", "payer", "debtor"] as const;
export type ReceiptsCategoryFilter = (typeof receiptsCategoryFilters)[number];
// Enum representing possible error codes when downloading a receipt
// Explained in https://editor.swagger.io/?url=https://raw.githubusercontent.com/pagopa/pagopa-biz-events-service/refs/tags/0.2.3/openapi/openapi_lap_jwt.json description
export enum DownloadReceiptOutcomeErrorEnum {
  GN_400_003 = "GN_400_003",
  GN_500_001 = "GN_500_001",
  GN_500_002 = "GN_500_002",
  GN_500_003 = "GN_500_003",
  GN_500_004 = "GN_500_004",
  FG_000_001 = "FG_000_001",
  UN_500_000 = "UN_500_000",
  BZ_404_003 = "BZ_404_003",
  AT_404_001 = "AT_404_001",
  AT_404_002 = "AT_404_002"
}

export type ReceiptDownloadFailure = ProblemJson & {
  code?: DownloadReceiptOutcomeErrorEnum;
};
