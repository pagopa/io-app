import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

export enum WalletPaymentOutcomeEnum {
  AUTH_ERROR = "2", // authorization denied
  AUTH_REQUEST_ERROR = "1000", // authorization request is in error
  BE_NODE_KO = "99", // Backend error when the node service is down
  CANCELED_BY_USER = "8", // canceled by the user
  CIRCUIT_ERROR = "5", // Unsupported circuit (should never happen)
  CVV_ERROR = "117", // CVV error
  DUPLICATE_ORDER = "9", // Double transaction (should never happen)
  EXCESSIVE_AMOUNT = "10", // Excess of availability
  GENERIC_ERROR = "1",
  IN_APP_BROWSER_CLOSED_BY_USER = "24", // in-app browser closed by user (24 because from 19 to 23 are already used by backend)
  INSUFFICIENT_AVAILABILITY_ERROR = "116", // insufficient availability
  INVALID_CARD = "7", // expired card (or similar)
  INVALID_DATA = "3", // incorrect data
  INVALID_METHOD = "12", // (should never happen)
  INVALID_SESSION = "14", // transaction failed
  KO_RETRIABLE = "13", // transaction failed
  METHOD_NOT_ENABLED = "15", // payment method not enabled
  MISSING_FIELDS = "6", // missing data (should never happen)
  ORDER_NOT_PRESENT = "11", // (should never happen)
  PAYMENT_REVERSED = "18", // "Storno"
  PAYPAL_REMOVED_ERROR = "19", // error while executing the payment with PayPal
  PLAFOND_LIMIT_ERROR = "121", // plafond limit error
  PSP_ERROR = "25", // PSP error
  SUCCESS = "0", // payment completed successfully
  TIMEOUT = "4", // timeout
  WAITING_CONFIRMATION_EMAIL = "17" // waiting for confirmation email
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
