import * as t from "io-ts";
import { enumType } from "@pagopa/ts-commons/lib/types";

export enum FaultCodeCategoryEnum {
  "PSP_PAYMENT_METHOD_NOT_AVAILABLE_ERROR" = "PSP_PAYMENT_METHOD_NOT_AVAILABLE_ERROR"
}

// required attributes
const PspPaymentMethodNotAvailableProblemJsonR = t.type({
  faultCodeCategory: enumType<FaultCodeCategoryEnum>(
    FaultCodeCategoryEnum,
    "faultCodeCategory"
  ),

  faultCodeDetail: t.string
});

// optional attributes
const PspPaymentMethodNotAvailableProblemJsonO = t.partial({
  title: t.string
});

export const PspPaymentMethodNotAvailableProblemJson = t.intersection(
  [
    PspPaymentMethodNotAvailableProblemJsonR,
    PspPaymentMethodNotAvailableProblemJsonO
  ],
  "PspPaymentMethodNotAvailableProblemJson"
);

export type PspPaymentMethodNotAvailableProblemJson = t.TypeOf<
  typeof PspPaymentMethodNotAvailableProblemJson
>;
