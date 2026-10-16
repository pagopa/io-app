import { CodeEnum } from "@io-app/api-types/generated/definitions/idpay/TransactionErrorDTO";
import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

enum SessionExpiredEnum {
  SESSION_EXPIRED = "SESSION_EXPIRED"
}

export type PaymentFailureEnum = CodeEnum | SessionExpiredEnum;
export const PaymentFailureEnum = {
  ...SessionExpiredEnum,
  ...CodeEnum
};

export type PaymentFailure = t.TypeOf<typeof PaymentFailure>;
export const PaymentFailure = enumType<PaymentFailureEnum>(
  PaymentFailureEnum,
  "PaymentFailureEnum"
);
