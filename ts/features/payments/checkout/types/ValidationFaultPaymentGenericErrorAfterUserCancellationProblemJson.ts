import * as t from "io-ts";
import { enumType } from "@pagopa/ts-commons/lib/types";

export enum FaultCodeCategoryEnum {
  "PAYMENT_GENERIC_ERROR_AFTER_USER_CANCELLATION" = "PAYMENT_GENERIC_ERROR_AFTER_USER_CANCELLATION"
}

// required attributes
const ValidationFaultPaymentGenericErrorAfterUserCancellationProblemJsonR =
  t.type({
    faultCodeCategory: enumType<FaultCodeCategoryEnum>(
      FaultCodeCategoryEnum,
      "faultCodeCategory"
    ),

    faultCodeDetail: t.string
  });

// optional attributes
const ValidationFaultPaymentGenericErrorAfterUserCancellationProblemJsonO =
  t.partial({
    title: t.string
  });

export const ValidationFaultPaymentGenericErrorAfterUserCancellationProblemJson =
  t.intersection(
    [
      ValidationFaultPaymentGenericErrorAfterUserCancellationProblemJsonR,
      ValidationFaultPaymentGenericErrorAfterUserCancellationProblemJsonO
    ],
    "ValidationFaultPaymentGenericErrorAfterUserCancellationProblemJson"
  );

export type ValidationFaultPaymentGenericErrorAfterUserCancellationProblemJson =
  t.TypeOf<
    typeof ValidationFaultPaymentGenericErrorAfterUserCancellationProblemJson
  >;
