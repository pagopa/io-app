import { fromNullable } from "fp-ts/lib/Option";
import { IResponseType } from "italia-ts-commons/lib/requests";

import { detailEnum } from "../../definitions/backend/PaymentProblemJson";
import { PaymentProblemJson } from "./../../definitions/backend/PaymentProblemJson";

import I18n from "../i18n";

export type NodoErrors =
  | keyof typeof detailEnum
  | "GENERIC_ERROR"
  | "MISSING_PAYMENT_ID";
type PaymentManagerErrors = "GENERIC_ERROR"; // no specific errors are available
export type PagoPaErrors = NodoErrors | PaymentManagerErrors;

export const extractNodoError = (
  response: IResponseType<number, any> | undefined
): NodoErrors =>
  response && PaymentProblemJson.is(response.value)
    ? response.value.detail
    : "GENERIC_ERROR";

export const extractPaymentManagerError = (
  _: string | undefined
): PaymentManagerErrors => "GENERIC_ERROR";

export const mapErrorCodeToMessage = (error: string): string => {
  const mapping: { [key: string]: string } = {
    PAYMENT_DUPLICATED: I18n.t("wallet.errors.PAYMENT_DUPLICATED"),
    INVALID_AMOUNT: I18n.t("wallet.errors.INVALID_AMOUNT"),
    PAYMENT_ONGOING: I18n.t("wallet.errors.PAYMENT_ONGOING"),
    PAYMENT_EXPIRED: I18n.t("wallet.errors.PAYMENT_EXPIRED"),
    PAYMENT_UNAVAILABLE: I18n.t("wallet.errors.PAYMENT_UNAVAILABLE"),
    PAYMENT_UNKNOWN: I18n.t("wallet.errors.PAYMENT_UNKNOWN"),
    DOMAIN_UNKNOWN: I18n.t("wallet.errors.DOMAIN_UNKNOWN"),
    GENERIC_ERROR: I18n.t("wallet.errors.GENERIC_ERROR"),
    MISSING_PAYMENT_ID: I18n.t("wallet.errors.MISSING_PAYMENT_ID")
  };

  return fromNullable(mapping[error]).getOrElse(mapping.GENERIC_ERROR);
};
