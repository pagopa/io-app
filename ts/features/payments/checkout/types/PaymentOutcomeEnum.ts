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
  INVALID_SESSION = "14", // transaction failed
  METHOD_NOT_ENABLED = "15", // payment method not enabled
  WAITING_CONFIRMATION_EMAIL = "17", // waiting for confirmation email
  PAYMENT_REVERSED = "18", // "Storno"
  PAYPAL_REMOVED_ERROR = "19", // error while executing the payment with PayPal
  IN_APP_BROWSER_CLOSED_BY_USER = "24", // in-app browser closed by user (24 because from 19 to 23 are already used by backend)
  PSP_ERROR = "25", // PSP error
  BE_NODE_KO = "99", // Backend error when the node service is down
  INSUFFICIENT_AVAILABILITY_ERROR = "116", // insufficient availability
  CVV_ERROR = "117", // CVV error
  PLAFOND_LIMIT_ERROR = "121", // plafond limit error
  AUTH_REQUEST_ERROR = "1000" // authorization request is in error
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
