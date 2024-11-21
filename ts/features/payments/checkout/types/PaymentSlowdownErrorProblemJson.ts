import * as t from "io-ts";
import { enumType } from "@pagopa/ts-commons/lib/types";

export enum FaultCodeCategoryEnum {
  "PAYMENT_SLOWDOWN_ERROR" = "PAYMENT_SLOWDOWN_ERROR"
}

// required attributes
const PaymentSlowdownErrorProblemJsonR = t.type({
  faultCodeCategory: enumType<FaultCodeCategoryEnum>(
    FaultCodeCategoryEnum,
    "faultCodeCategory"
  ),

  faultCodeDetail: t.string
});

// optional attributes
const PaymentSlowdownErrorProblemJsonO = t.partial({
  title: t.string
});

export const PaymentSlowdownErrorProblemJson = t.intersection(
  [PaymentSlowdownErrorProblemJsonR, PaymentSlowdownErrorProblemJsonO],
  "PaymentSlowdownErrorProblemJson"
);

export type PaymentSlowdownErrorProblemJson = t.TypeOf<
  typeof PaymentSlowdownErrorProblemJson
>;
