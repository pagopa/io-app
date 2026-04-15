import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";
import { CodeEnum } from "../../../../../definitions/idpay/TransactionErrorDTO";

enum SessionExpiredEnum {
  SESSION_EXPIRED = "SESSION_EXPIRED"
}

export type PaymentFailureEnum = SessionExpiredEnum | CodeEnum;
export const PaymentFailureEnum = {
  ...SessionExpiredEnum,
  ...CodeEnum
};

export type PaymentFailure = t.TypeOf<typeof PaymentFailure>;
export const PaymentFailure = enumType<PaymentFailureEnum>(
  PaymentFailureEnum,
  "PaymentFailureEnum"
);
