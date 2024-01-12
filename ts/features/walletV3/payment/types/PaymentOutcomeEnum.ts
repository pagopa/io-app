import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

export enum WalletPaymentOutcomeEnum {
  SUCCESS = "0", // payment completed successfully
  GENERIC_ERROR = "1",
  AUTH_ERROR = "2", // authorization denied
  INVALID_DATA = "3", // incorrect data
  TIMEOUT = "4", // timeout
  CIRCUIT_ERROR = "5", // Unsupported circuit (should never happen)
  MISSING_FIELDS = "6", // missing data (should never happen)
  INVALID_CARD = "7", // expired card (or similar)
  CANCELED_BY_USER = "8", // canceled by the user
  DUPLICATE_ORDER = "9", // Double transaction (should never happen)
  EXCESSIVE_AMOUNT = "10", // Excess of availability
  ORDER_NOT_PRESENT = "11", // (should never happen)
  INVALID_METHOD = "12", // (should never happen)
  KO_RETRIABLE = "13", // transaction failed
  INVALID_SESSION = "14" // transaction failed
}

export type WalletPaymentOutcome = t.TypeOf<typeof WalletPaymentOutcome>;
export const WalletPaymentOutcome = enumType<WalletPaymentOutcomeEnum>(
  WalletPaymentOutcomeEnum,
  "WalletPaymentOutcome"
);

export function getWalletPaymentOutcomeEnumByValue(
  value: string
): string | undefined {
  return (
    Object.keys(WalletPaymentOutcomeEnum) as Array<
      keyof typeof WalletPaymentOutcomeEnum
    >
  ).find(key => WalletPaymentOutcomeEnum[key] === value);
}
