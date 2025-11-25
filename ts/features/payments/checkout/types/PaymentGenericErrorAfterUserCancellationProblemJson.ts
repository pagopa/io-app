import * as t from "io-ts";
import { enumType } from "@pagopa/ts-commons/lib/types";

enum FaultCodeCategoryEnum {
  "PAYMENT_GENERIC_ERROR_AFTER_USER_CANCELLATION" = "PAYMENT_GENERIC_ERROR_AFTER_USER_CANCELLATION"
}

// required attributes
const PaymentGenericErrorAfterUserCancellationProblemJsonR = t.type({
  faultCodeCategory: enumType<FaultCodeCategoryEnum>(
    FaultCodeCategoryEnum,
    "faultCodeCategory"
  ),

  faultCodeDetail: t.string
});

// optional attributes
const PaymentGenericErrorAfterUserCancellationProblemJsonO = t.partial({
  title: t.string
});

export const PaymentGenericErrorAfterUserCancellationProblemJson =
  t.intersection(
    [
      PaymentGenericErrorAfterUserCancellationProblemJsonR,
      PaymentGenericErrorAfterUserCancellationProblemJsonO
    ],
    "PaymentGenericErrorAfterUserCancellationProblemJson"
  );

export type PaymentGenericErrorAfterUserCancellationProblemJson = t.TypeOf<
  typeof PaymentGenericErrorAfterUserCancellationProblemJson
>;
