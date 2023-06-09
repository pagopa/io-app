import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

export enum PaymentFailureEnum {
  GENERIC = "GENERIC",
  // Transaction cancelled by the user
  CANCELLED = "CANCELLED"
  // TODO failure mapping will be added in another PR
}

export type PaymentFailure = t.TypeOf<typeof PaymentFailure>;
export const PaymentFailure = enumType<PaymentFailureEnum>(
  PaymentFailureEnum,
  "PaymentFailureEnum"
);
