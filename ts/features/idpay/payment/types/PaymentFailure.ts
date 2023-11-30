import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

export enum PaymentFailureEnum {
  GENERIC = "GENERIC",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
  TRANSACTION_EXPIRED = "TRANSACTION_EXPIRED",
  USER_SUSPENDED = "USER_SUSPENDED",
  USER_NOT_ONBOARDED = "USER_NOT_ONBOARDED",
  USER_UNSUBSCRIBED = "USER_UNSUBSCRIBED",
  ALREADY_AUTHORIZED = "ALREADY_AUTHORIZED",
  BUDGET_EXHAUSTED = "BUDGET_EXHAUSTED",
  ALREADY_ASSIGNED = "ALREADY_ASSIGNED",
  INVALID_DATE = "INVALID_DATE",
  SESSION_EXPIRED = "SESSION_EXPIRED"
}

export type PaymentFailure = t.TypeOf<typeof PaymentFailure>;
export const PaymentFailure = enumType<PaymentFailureEnum>(
  PaymentFailureEnum,
  "PaymentFailureEnum"
);
