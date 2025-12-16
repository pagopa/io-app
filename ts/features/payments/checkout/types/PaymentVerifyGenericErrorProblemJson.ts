import * as t from "io-ts";
import { enumType } from "@pagopa/ts-commons/lib/types";

export enum FaultCodeCategoryEnum {
  "PAYMENT_VERIFY_GENERIC_ERROR" = "PAYMENT_VERIFY_GENERIC_ERROR"
}

// required attributes
const PaymentVerifyGenericErrorProblemJsonR = t.type({
  faultCodeCategory: enumType<FaultCodeCategoryEnum>(
    FaultCodeCategoryEnum,
    "faultCodeCategory"
  ),

  faultCodeDetail: t.string
});

// optional attributes
const PaymentVerifyGenericErrorProblemJsonO = t.partial({
  title: t.string
});

export const PaymentVerifyGenericErrorProblemJson = t.intersection(
  [
    PaymentVerifyGenericErrorProblemJsonR,
    PaymentVerifyGenericErrorProblemJsonO
  ],
  "PaymentVerifyGenericErrorProblemJson"
);

export type PaymentVerifyGenericErrorProblemJson = t.TypeOf<
  typeof PaymentVerifyGenericErrorProblemJson
>;
