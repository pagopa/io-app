import { fromNullable, Option } from "fp-ts/lib/Option";
import { detailEnum } from "../../definitions/backend/PaymentProblemJson";
import { NodoErrorResponseType } from "../api/backend";
import { PaymentManagerErrorType } from "../api/pagopa";

export type NodoErrors = detailEnum | "GENERIC_ERROR" | "MISSING_PAYMENT_ID";
export type PaymentManagerErrors = "GENERIC_ERROR"; // no specific errors are available
export type PagoPaErrors = NodoErrors | PaymentManagerErrors;

export const extractNodoError = (
  response: NodoErrorResponseType | undefined
): NodoErrors => {
  const maybeDetail: Option<NodoErrors> = fromNullable(response).mapNullable(
    r => (r.status === 500 ? r.value.detail : undefined)
  );
  return maybeDetail.getOrElse("GENERIC_ERROR");
};

export const extractPaymentManagerError = (
  _: PaymentManagerErrorType | undefined
): PaymentManagerErrors => "GENERIC_ERROR";

export const mapErrorCodeToMessage = (error: string): string => {
  // TODO: create adequate messages & translate them
  const mapping: { [key: string]: string } = {
    PAYMENT_DUPLICATED: "PAYMENT_DUPLICATED",
    INVALID_AMOUNT: "INVALID_AMOUNT",
    PAYMENT_ONGOING: "PAYMENT_ONGOING",
    PAYMENT_EXPIRED: "PAYMENT_EXPIRED",
    PAYMENT_UNAVAILABLE: "PAYMENT_UNAVAILABLE",
    PAYMENT_UNKNOWN: "PAYMENT_UNKNOWN",
    DOMAIN_UNKNOWN: "DOMAIN_UNKNOWN",
    GENERIC_ERROR: "GENERIC_ERROR",
    MISSING_PAYMENT_ID: "MISSING_PAYMENT_ID"
  };

  return fromNullable(mapping[error]).getOrElse(mapping.GENERIC_ERROR);
};
