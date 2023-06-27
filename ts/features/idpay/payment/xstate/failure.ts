import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

export enum PaymentFailureEnum {
  GENERIC = "GENERIC",
  // Transaction was rejected by the operator
  REJECTED = "REJECTED",
  // User session expired
  EXPIRED = "EXPIRED",
  // User does not have enough budget
  BUDGET_EXHAUSTED = "BUDGET_EXHAUSTED",
  // 429 Too Many Requests
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS"
}

export type PaymentFailure = t.TypeOf<typeof PaymentFailure>;
export const PaymentFailure = enumType<PaymentFailureEnum>(
  PaymentFailureEnum,
  "PaymentFailureEnum"
);
