import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

export enum PaymentFailureEnum {
  // Generic/client failure
  GENERIC = "GENERIC",
  // Transaction was not found
  NOT_FOUND = "NOT_FOUND",
  // Citizen not onboarded to the initiative or transaction associated to another user
  NOT_ACTIVE = "NOT_ACTIVE",
  // Transaction is not in IDENTIFIED or AUTHORIZED state
  NOT_VALID = "NOT_VALID"
}

export type PaymentFailure = t.TypeOf<typeof PaymentFailure>;
export const PaymentFailure = enumType<PaymentFailureEnum>(
  PaymentFailureEnum,
  "PaymentFailureEnum"
);
