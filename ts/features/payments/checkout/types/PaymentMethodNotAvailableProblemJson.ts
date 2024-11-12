import * as t from "io-ts";
import { enumType } from "@pagopa/ts-commons/lib/types";

export enum FaultCodeCategoryEnum {
  "PAYMENT_METHOD_NOT_AVAILABLE_ERROR" = "PAYMENT_METHOD_NOT_AVAILABLE_ERROR"
}

// required attributes
const PaymentMethodNotAvailableProblemJsonR = t.type({
  faultCodeCategory: enumType<FaultCodeCategoryEnum>(
    FaultCodeCategoryEnum,
    "faultCodeCategory"
  ),

  faultCodeDetail: t.string
});

// optional attributes
const PaymentMethodNotAvailableProblemJsonO = t.partial({
  title: t.string
});

export const PaymentMethodNotAvailableProblemJson = t.intersection(
  [
    PaymentMethodNotAvailableProblemJsonR,
    PaymentMethodNotAvailableProblemJsonO
  ],
  "PaymentMethodNotAvailableProblemJson"
);

export type PaymentMethodNotAvailableProblemJson = t.TypeOf<
  typeof PaymentMethodNotAvailableProblemJson
>;
