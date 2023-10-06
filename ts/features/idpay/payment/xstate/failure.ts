import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

export enum PaymentFailureEnum {
  GENERIC = "GENERIC",
  // Transaction was rejected by the operator
  REJECTED = "REJECTED",
  // User session expired
  EXPIRED = "EXPIRED",
  // Transaction was already authorized
  AUTHORIZED = "AUTHORIZED",
  // User does not have enough budget
  BUDGET_EXHAUSTED = "BUDGET_EXHAUSTED",
  // 429 Too Many Requests
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
  // 401
  SESSION_EXPIRED = "SESSION_EXPIRED"
}

export type PaymentFailure = t.TypeOf<typeof PaymentFailure>;
export const PaymentFailure = enumType<PaymentFailureEnum>(
  PaymentFailureEnum,
  "PaymentFailureEnum"
);
